-- ────────────────────────────────────────────────────────────────────────────
-- pg_cron schedule for the send-renewal-reminders Edge Function
--
-- Run this SQL in:
--   Supabase Dashboard → SQL Editor → New query
--
-- Prerequisites:
--   1. The pg_cron and pg_net extensions must be enabled in your project:
--        Supabase Dashboard → Database → Extensions → enable pg_cron and pg_net
--   2. Deploy the Edge Function first:
--        supabase functions deploy send-renewal-reminders
--   3. Set all required secrets in:
--        Supabase Dashboard → Edge Functions → send-renewal-reminders → Secrets:
--          RESEND_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
--          TWILIO_FROM_NUMBER, APP_URL, FROM_EMAIL
--
-- Replace the placeholders below:
--   <YOUR_PROJECT_REF>    — your Supabase project ref (e.g. "abcdefghijklmnop")
--   <YOUR_SERVICE_ROLE_KEY> — your project's service_role JWT
-- ────────────────────────────────────────────────────────────────────────────

-- Enable required extensions if not already active
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any existing schedule with the same name (safe to re-run)
SELECT cron.unschedule('renewal-reminders') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'renewal-reminders'
);

-- Schedule: every day at 09:00 UTC
SELECT cron.schedule(
  'renewal-reminders',
  '0 9 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-renewal-reminders',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>'
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- Verify the schedule was created
SELECT jobname, schedule, command
FROM cron.job
WHERE jobname = 'renewal-reminders';

-- ────────────────────────────────────────────────────────────────────────────
-- To trigger manually for testing (without waiting for 09:00 UTC):
-- ────────────────────────────────────────────────────────────────────────────
--
--   SELECT net.http_post(
--     url     := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-renewal-reminders',
--     headers := jsonb_build_object(
--       'Content-Type',  'application/json',
--       'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>'
--     ),
--     body    := '{}'::jsonb
--   );
--
-- Or via Supabase CLI:
--   supabase functions invoke send-renewal-reminders --no-verify-jwt
--
-- ────────────────────────────────────────────────────────────────────────────
-- To inspect recent cron job runs:
-- ────────────────────────────────────────────────────────────────────────────
--
--   SELECT * FROM cron.job_run_details
--   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'renewal-reminders')
--   ORDER BY start_time DESC
--   LIMIT 20;
--
-- To view the reminder log:
--
--   SELECT
--     b.name AS business,
--     l.form_name,
--     l.renewal_date,
--     l.days_before,
--     l.channel,
--     l.success,
--     l.error_message,
--     l.sent_at
--   FROM renewal_reminder_log l
--   JOIN businesses b ON b.id = l.business_id
--   ORDER BY l.sent_at DESC
--   LIMIT 50;
--
-- ────────────────────────────────────────────────────────────────────────────
-- To remove the schedule:
-- ────────────────────────────────────────────────────────────────────────────
--
--   SELECT cron.unschedule('renewal-reminders');
-- ────────────────────────────────────────────────────────────────────────────
