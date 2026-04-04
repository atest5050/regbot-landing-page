-- Migration: Renewal reminder notifications
--
-- 1. Add notification_prefs JSONB column to businesses
--    Shape: { emailEnabled: boolean, smsEnabled: boolean, phone?: string }
--    Nullable; NULL means "use defaults" (email on, SMS off).
--
-- 2. Add phone column to profiles so users can store their SMS number once
--    and reuse it across all businesses without re-entering it.
--
-- 3. Create renewal_reminder_log table to deduplicate sends.
--    The unique constraint (business_id, checklist_item_id, renewal_date,
--    days_before, channel) ensures each reminder fires exactly once per
--    renewal cycle per channel.

-- ── 1. businesses.notification_prefs ─────────────────────────────────────────

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT NULL;

COMMENT ON COLUMN public.businesses.notification_prefs IS
  'Per-business notification preferences. '
  'Shape: { emailEnabled: boolean, smsEnabled: boolean, phone?: string }. '
  'NULL means use account defaults (email enabled, SMS disabled).';

-- ── 2. profiles.phone ─────────────────────────────────────────────────────────
-- Stored in E.164 format, e.g. "+14155552671". Optional — only needed for SMS.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT NULL;

COMMENT ON COLUMN public.profiles.phone IS
  'E.164 phone number for SMS renewal reminders, e.g. "+14155552671". '
  'Optional. Set by the user in Notification Preferences.';

-- ── 3. renewal_reminder_log ────────────────────────────────────────────────────
-- One row per sent reminder. The unique constraint makes the daily cron job
-- idempotent: re-running for a given day is safe and sends nothing twice.

CREATE TABLE IF NOT EXISTS public.renewal_reminder_log (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID          NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  business_id         TEXT          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  -- item.id from the JSONB checklist snapshot in businesses.checklist
  checklist_item_id   TEXT          NOT NULL,
  -- item.formId (e.g. "business-license")
  form_id             TEXT          NOT NULL,
  -- item.text (permit name) — stored for audit readability
  form_name           TEXT          NOT NULL,
  -- The renewal date this reminder is for (YYYY-MM-DD)
  renewal_date        DATE          NOT NULL,
  -- How many days before renewal_date this reminder was sent
  days_before         INTEGER       NOT NULL,
  -- 'email' or 'sms'
  channel             TEXT          NOT NULL CHECK (channel IN ('email', 'sms')),
  -- Whether the send succeeded
  success             BOOLEAN       NOT NULL DEFAULT TRUE,
  -- Error message if success = false
  error_message       TEXT          DEFAULT NULL,
  sent_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Deduplication: one reminder per (business, item, renewal_date, milestone, channel)
  CONSTRAINT renewal_reminder_log_unique
    UNIQUE (business_id, checklist_item_id, renewal_date, days_before, channel)
);

ALTER TABLE public.renewal_reminder_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own reminder history (for a future "Notification History" page)
CREATE POLICY "reminder_log_select_own" ON public.renewal_reminder_log
  FOR SELECT USING (auth.uid() = user_id);

-- Only the service role (Edge Function) inserts rows — no user-facing insert policy needed.

CREATE INDEX IF NOT EXISTS reminder_log_user_idx
  ON public.renewal_reminder_log (user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS reminder_log_business_idx
  ON public.renewal_reminder_log (business_id, renewal_date);
