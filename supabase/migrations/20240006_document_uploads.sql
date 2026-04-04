-- Migration: business_documents table + Supabase Storage bucket for uploaded compliance docs.
--
-- Users can upload permits, licenses, inspection reports, and any compliance-related
-- documents. The AI analyzes each upload and extracts structured data.
--
-- Storage path convention:
--   business-documents/{user_id}/{business_id}/{timestamp}-{filename}

-- ── 1. business_documents table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.business_documents (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  business_id     TEXT          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  -- Original filename as uploaded by the user
  original_name   TEXT          NOT NULL,
  -- MIME type: application/pdf, image/jpeg, image/png, etc.
  mime_type       TEXT          NOT NULL,
  -- File size in bytes
  size_bytes      BIGINT        NOT NULL,
  -- Full storage path inside the 'business-documents' bucket
  storage_path    TEXT          NOT NULL,
  -- AI-extracted analysis (see DocumentAnalysis in regbot-types.ts)
  analysis        JSONB         DEFAULT NULL,
  -- Whether analysis completed successfully
  analyzed        BOOLEAN       NOT NULL DEFAULT FALSE,
  uploaded_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- Soft-delete so history is preserved even if the user removes the document
  deleted_at      TIMESTAMPTZ   DEFAULT NULL,

  CONSTRAINT business_documents_storage_path_unique UNIQUE (storage_path)
);

ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "biz_docs_select_own" ON public.business_documents
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "biz_docs_insert_own" ON public.business_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "biz_docs_update_own" ON public.business_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS biz_docs_business_idx
  ON public.business_documents (business_id, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS biz_docs_user_idx
  ON public.business_documents (user_id, uploaded_at DESC);

-- ── 2. Storage bucket: business-documents ────────────────────────────────────
-- Run this in the Supabase Dashboard → Storage (or via the Management API).
-- The SQL below uses the storage schema helpers available in recent Supabase versions.

-- Create the bucket (private — files are not publicly readable by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-documents',
  'business-documents',
  FALSE,   -- private bucket; use signed URLs for access
  20971520, -- 20 MB per file
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only read/write their own subfolder
CREATE POLICY "biz_docs_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'business-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "biz_docs_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'business-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "biz_docs_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'business-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
