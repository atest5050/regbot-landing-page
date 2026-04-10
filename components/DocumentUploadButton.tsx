"use client";

// DocumentUploadButton — drag-and-drop + click-to-upload trigger.
//
// Two variants:
//   "compact" — small icon button for the chat input bar
//   "full"    — larger card-style zone for the checklist sidebar
//
// Two modes (v25):
//   "analyze" (default) — uploads + runs AI analysis via /api/document/analyze
//   "attach"            — uploads to Supabase Storage only, skips AI analysis,
//                         calls onAttachComplete with the storage path.
//                         Used for "Upload Completed Document" to attach existing
//                         permits/licenses without re-running the analyzer.
//
// Upload flow (v16 — dual-mode):
//   Files ≤ 5 MB  → FormData POST directly to /api/document/analyze  (legacy path)
//   Files > 5 MB  → Upload to Supabase Storage first, then POST a small JSON body
//                   { storagePath, fileName, mimeType, … } to /api/document/analyze
//                   (storage-first path — avoids App Router body size limit entirely)
//
// On success, calls onAnalysisComplete with the parsed DocumentAnalysis result.
// On error, shows an inline error message.
//
// Change log (v16 — Frontend Storage-First Upload):
//   • Root cause: App Router serverless functions have a hard ~4.5 MB body limit
//     that cannot be raised via config.api.bodyParser (Pages Router only).
//     Large IRS PDFs (8–15 MB) were hitting this limit before the handler ran,
//     causing an HTML "Request Entity Too Large" response that JSON.parse rejected.
//   • Fix: for files > 5 MB, upload the raw file directly from the browser to
//     Supabase Storage (anon/auth client, no API route involved), then send only
//     a small JSON body with the storage path to /api/document/analyze.
//     The backend downloads the file from storage and runs AI analysis.
//     No large body ever reaches the Next.js API route.
//   • Files ≤ 5 MB continue to use the existing FormData path unchanged.
//   • Progress indicator now shows two phases for large files:
//       0–60 %  — uploading to Supabase Storage
//       60–100% — backend AI analysis
//   • Requires the user to be authenticated for large-file uploads (storage RLS).
//     Unauthenticated users uploading large files get a clear error message.

import { useRef, useState, useCallback } from "react";
import { Upload, Paperclip, X, FileText, Image, Loader2, AlertCircle } from "lucide-react";
import type { DocumentAnalysis } from "@/lib/regbot-types";
import type { ChecklistItem } from "@/lib/checklist";
import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  analysis: DocumentAnalysis;
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

// v25 — Attach mode: upload result without AI analysis
export interface AttachResult {
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

interface Props {
  /** Active business ID — used for Storage path scoping */
  businessId?: string;
  businessName?: string;
  location?: string;
  checklist?: ChecklistItem[];
  onAnalysisComplete: (result: AnalysisResult) => void;
  /**
   * v25 — Called when mode="attach" upload succeeds.
   * Receives the storage path + file metadata; no AI analysis is run.
   */
  onAttachComplete?: (result: AttachResult) => void;
  /** "compact" shows a small icon button; "full" shows a drop-zone card */
  variant?: "compact" | "full";
  /**
   * v25 — Upload mode.
   * "analyze" (default): upload + run AI analysis via /api/document/analyze.
   * "attach": upload to Supabase Storage only, skip analysis, call onAttachComplete.
   */
  mode?: "analyze" | "attach";
  disabled?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCEPTED = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/tiff",
];
const ACCEPTED_EXT = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.tiff";
const MAX_MB = 20;

// v16: Files above this threshold bypass the API body entirely.
// The browser uploads directly to Supabase Storage; the API receives only a
// small JSON body containing the storage path.
const STORAGE_FIRST_THRESHOLD_BYTES = 5 * 1024 * 1024; // 5 MB

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string) {
  if (mime === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
  return <Image className="h-4 w-4 text-blue-500" />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DocumentUploadButton({
  businessId,
  businessName = "My Business",
  location = "",
  checklist = [],
  onAnalysisComplete,
  onAttachComplete,
  variant = "compact",
  mode = "analyze",
  disabled = false,
}: Props) {
  const inputRef                     = useRef<HTMLInputElement>(null);
  const [dragging,  setDragging]     = useState(false);
  const [uploading, setUploading]    = useState(false);
  const [progress,  setProgress]     = useState(0);   // 0–100 simulated
  const [phase,     setPhase]        = useState<"uploading" | "analyzing">("uploading");
  const [error,     setError]        = useState<string | null>(null);
  const [fileName,  setFileName]     = useState<string | null>(null);

  // Validate before upload
  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) {
      return `Unsupported file type (${file.type}). Please upload a PDF, JPG, PNG, or WebP.`;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return `File too large (${formatBytes(file.size)}). Max ${MAX_MB} MB.`;
    }
    return null;
  };

  const upload = useCallback(async (file: File) => {
    const validationError = validate(file);
    if (validationError) { setError(validationError); return; }

    setError(null);
    setUploading(true);
    setFileName(file.name);
    setProgress(10);
    setPhase("uploading");

    // Simulate progress ticks while work is happening server-side.
    // The ticker is cleared and progress is set explicitly at each phase boundary.
    const ticker = setInterval(() => {
      setProgress(p => Math.min(p + 6, 85));
    }, 700);

    try {
      // ── v25 — Attach mode: upload to storage only, skip AI analysis ───────────
      // Used for "Upload Completed Document" to store existing permits/licenses.
      if (mode === "attach") {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Please sign in to upload completed documents.");
        }
        if (!businessId) {
          throw new Error("Select or save a business before uploading a document.");
        }
        const ts          = Date.now();
        const safeName    = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${user.id}/${businessId}/${ts}-${safeName}`;

        const { error: storageErr } = await supabase.storage
          .from("business-documents")
          .upload(storagePath, file, { contentType: file.type, upsert: false });

        clearInterval(ticker);

        if (storageErr) throw new Error(`Upload failed: ${storageErr.message}`);

        setProgress(100);
        setTimeout(() => {
          setUploading(false);
          setFileName(null);
          setProgress(0);
          setPhase("uploading");
          onAttachComplete?.({
            storagePath,
            fileName:  file.name,
            mimeType:  file.type,
            sizeBytes: file.size,
          });
        }, 300);
        return;
      }

      // ── v18 — Force storage-first for ALL PDFs (testing) ─────────────────────
      // Previously the storage-first path only activated for files > 5 MB.
      // Vercel's body limit was still being hit because the threshold check was
      // not firing in practice (businessId undefined, wrong mime detection, etc.).
      // For now: ALL application/pdf uploads go through storage-first regardless
      // of size. Images and other types keep the existing FormData path.
      // Revert to the size-threshold logic once confirmed working end-to-end.
      const useStorageFirst = (file.type === "application/pdf" || file.size > STORAGE_FIRST_THRESHOLD_BYTES) && !!businessId;

      let res: Response;

      if (useStorageFirst) {
        // ── Storage-first path (files > 5 MB) ──────────────────────────────────
        //
        // Phase 1 — Browser → Supabase Storage (no API route, no body size limit)
        // Phase 2 — API downloads from storage and runs AI analysis
        //
        // This bypasses the Next.js App Router ~4.5 MB body limit entirely.
        // The analyze endpoint receives only a small JSON body with the path.

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Please sign in to upload documents larger than 5 MB.");
        }

        // Build a deterministic, collision-resistant storage path.
        const ts          = Date.now();
        const safeName    = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${user.id}/${businessId}/${ts}-${safeName}`;

        // Phase 1: upload raw file bytes directly from the browser.
        const { error: storageErr } = await supabase.storage
          .from("business-documents")
          .upload(storagePath, file, { contentType: file.type, upsert: false });

        if (storageErr) {
          throw new Error(`Storage upload failed: ${storageErr.message}`);
        }

        // Phase boundary: storage done, now waiting on AI analysis.
        clearInterval(ticker);
        setProgress(60);
        setPhase("analyzing");
        const analysisTicker = setInterval(() => {
          setProgress(p => Math.min(p + 5, 92));
        }, 800);

        // Phase 2: tell the backend where the file is — no large body involved.
        res = await fetch("/api/document/analyze", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storagePath,
            fileName:     file.name,
            mimeType:     file.type,
            sizeBytes:    file.size,
            businessId:   businessId ?? "",
            businessName,
            location,
            checklist:    JSON.stringify(checklist),
          }),
        });

        clearInterval(analysisTicker);

      } else {
        // ── FormData path (files ≤ 5 MB, unchanged from v1) ────────────────────
        const body = new FormData();
        body.append("file",         file);
        body.append("businessId",   businessId ?? "");
        body.append("businessName", businessName);
        body.append("location",     location);
        body.append("checklist",    JSON.stringify(checklist));

        res = await fetch("/api/document/analyze", { method: "POST", body });
        clearInterval(ticker);
      }

      setProgress(100);

      // v19 — Enhanced error logging and user-friendly messages
      // Parse the response and log the full object so DevTools / server logs
      // show exactly what the API returned — not just the status code.
      const data = await res.json() as {
        ok: boolean;
        error?: string;
        /** v19 — server includes a technical details string in every error response */
        details?: string;
      } & Partial<AnalysisResult>;

      // v19 — Always log the full API response to the browser console so developers
      // can see the exact server message without needing to open the Network tab.
      if (!data.ok || !res.ok) {
        console.error(
          "[DocumentUploadButton] API returned an error response:",
          {
            httpStatus: res.status,
            ok:         data.ok,
            error:      data.error,
            details:    data.details,
            fullResponse: data,
          },
        );
      } else {
        console.log(
          "[DocumentUploadButton] API success:",
          { httpStatus: res.status, docType: (data as Partial<AnalysisResult>).analysis?.docType },
        );
      }

      if (!res.ok || !data.ok) {
        // v19 — Show the server's human-readable error message first (e.g.
        // "PDF too large for the Vision API — try compressing the file").
        // Fall back to the technical details string, then a generic message.
        const serverMessage = data.error ?? data.details ?? "AI analysis failed. Please try again.";
        throw new Error(serverMessage);
      }

      setTimeout(() => {
        setUploading(false);
        setFileName(null);
        setProgress(0);
        setPhase("uploading");
        onAnalysisComplete({
          analysis:    data.analysis!,
          storagePath: data.storagePath ?? "",
          fileName:    data.fileName    ?? file.name,
          mimeType:    data.mimeType    ?? file.type,
          sizeBytes:   data.sizeBytes   ?? file.size,
        });
      }, 300);

    } catch (err) {
      clearInterval(ticker);
      setUploading(false);
      setProgress(0);
      setFileName(null);
      setPhase("uploading");
      setError((err as Error).message ?? "Upload failed. Please try again.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, businessName, location, checklist, onAnalysisComplete]);

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void upload(file);
    // Reset input so the same file can be re-uploaded
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void upload(file);
  };

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  // Progress label changes per phase for large-file uploads
  const progressLabel =
    phase === "uploading" && progress < 60
      ? "Uploading to storage…"
      : progress < 92
        ? "Analyzing document…"
        : "Finishing…";

  // ── Hidden file input (shared by both variants) ────────────────────────────

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPTED_EXT}
      onChange={handleFileChange}
      className="hidden"
      aria-hidden="true"
    />
  );

  // ── Compact variant (chat input bar) ───────────────────────────────────────

  if (variant === "compact") {
    return (
      <div className="relative">
        {hiddenInput}
        <button
          type="button"
          onClick={() => { setError(null); inputRef.current?.click(); }}
          disabled={disabled || uploading}
          title="Upload existing permit or license document"
          className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors shrink-0 ${
            uploading
              ? "bg-blue-50 border-blue-200 text-blue-500 cursor-not-allowed"
              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
          } disabled:opacity-40`}
        >
          {uploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Paperclip className="h-4 w-4" />}
        </button>

        {/* Uploading tooltip-style status */}
        {uploading && fileName && (
          <div className="absolute bottom-12 left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 z-20">
            <div className="flex items-center gap-2 mb-1.5">
              {fileIcon("application/pdf")}
              <p className="text-[11px] font-medium text-slate-700 truncate flex-1">{fileName}</p>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{progressLabel}</p>
          </div>
        )}

        {/* Error tooltip */}
        {error && (
          <div className="absolute bottom-12 left-0 w-56 bg-red-50 border border-red-200 rounded-xl shadow-lg p-2.5 z-20 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-red-700 leading-snug">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-[10px] text-red-500 hover:underline mt-0.5"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Full variant (checklist sidebar) ──────────────────────────────────────

  return (
    <div className="space-y-2">
      {hiddenInput}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => { if (!uploading && !disabled) { setError(null); inputRef.current?.click(); } }}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          disabled || uploading
            ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
            : dragging
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              <p className="text-xs font-medium text-blue-700">{progressLabel}</p>
              {fileName && (
                <p className="text-[10px] text-slate-400 truncate max-w-full">{fileName}</p>
              )}
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className={`h-6 w-6 ${dragging ? "text-blue-500" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  {dragging
                    ? (mode === "attach" ? "Drop to attach" : "Drop to analyze")
                    : (mode === "attach" ? "Upload Completed Document" : "Upload Document")}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  PDF, JPG, PNG · max {MAX_MB} MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-2.5 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-700 leading-snug flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-1">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <p className="text-[10px] text-slate-400 text-center leading-snug">
        {mode === "attach"
          ? "Attach completed permits, licenses, or filed forms to your business profile."
          : "Upload existing permits, licenses, or inspection reports. RegPulse AI will extract key info and update your checklist automatically."}
      </p>
    </div>
  );
}
