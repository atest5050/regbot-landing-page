-- ────────────────────────────────────────────────────────────────────────────
-- RegBot — businesses, rule_alerts, profiles
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ────────────────────────────────────────────────────────────────────────────

-- ── 1. profiles ─────────────────────────────────────────────────────────────
-- One row per auth.user. Created automatically by the trigger below.
-- Tracks Pro subscription status and monthly AI-form usage quota.

create table if not exists public.profiles (
  id            uuid      primary key references auth.users on delete cascade,
  is_pro        boolean   not null default false,
  -- Monthly usage counter for Free-tier AI form completions.
  -- Keyed by "YYYY-MM" so it resets automatically each month without a cron job.
  usage_month   text,              -- e.g. "2024-06"
  usage_count   integer  not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. businesses ────────────────────────────────────────────────────────────
-- One row per saved business per user. The checklist and completed_forms
-- columns are JSONB snapshots — they represent the business's state at the
-- time of the last save (not live checklist_items rows).

create table if not exists public.businesses (
  -- Use TEXT for the PK so the existing composite ID format from localStorage
  -- ("1717000000000-abc123") is preserved during guest-to-auth migration.
  id                    text        primary key,
  user_id               uuid        not null references auth.users on delete cascade,
  name                  text        not null,
  location              text        not null,

  -- JSONB snapshots of ChecklistItem[] and CompletedFormEntry[]
  checklist             jsonb       not null default '[]',
  completed_forms       jsonb       not null default '[]',

  -- Living-profile metrics (recalculated on each save/load)
  health_score          integer,
  total_forms           integer,
  completed_forms_count integer,

  saved_at              timestamptz not null default now(),
  last_checked          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "businesses_select_own" on public.businesses
  for select using (auth.uid() = user_id);

create policy "businesses_insert_own" on public.businesses
  for insert with check (auth.uid() = user_id);

create policy "businesses_update_own" on public.businesses
  for update using (auth.uid() = user_id);

create policy "businesses_delete_own" on public.businesses
  for delete using (auth.uid() = user_id);

create index if not exists businesses_user_id_idx
  on public.businesses (user_id, saved_at desc);

-- Keep updated_at current on every write.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute procedure public.set_updated_at();


-- ── 3. rule_alerts ──────────────────────────────────────────────────────────
-- One row per generated rule-change alert.
-- The composite TEXT primary key mirrors the localStorage format:
--   "{businessId}-{formId}-{YYYY-MM}"
-- This makes upserts idempotent: re-generating the same alert for the same
-- business + month is a no-op.

create table if not exists public.rule_alerts (
  id            text        primary key,  -- composite: "{bizId}-{formId}-{YYYY-MM}"
  user_id       uuid        not null references auth.users on delete cascade,
  business_id   text        references public.businesses(id) on delete cascade,
  business_name text        not null,
  title         text        not null,
  description   text        not null,
  affected_forms text[]     not null default '{}',
  date          date        not null,
  dismissed     boolean     not null default false,
  created_at    timestamptz not null default now()
);

alter table public.rule_alerts enable row level security;

create policy "rule_alerts_select_own" on public.rule_alerts
  for select using (auth.uid() = user_id);

create policy "rule_alerts_insert_own" on public.rule_alerts
  for insert with check (auth.uid() = user_id);

create policy "rule_alerts_update_own" on public.rule_alerts
  for update using (auth.uid() = user_id);

create policy "rule_alerts_delete_own" on public.rule_alerts
  for delete using (auth.uid() = user_id);

create index if not exists rule_alerts_user_id_idx
  on public.rule_alerts (user_id, date desc);

create index if not exists rule_alerts_business_id_idx
  on public.rule_alerts (business_id);


-- ────────────────────────────────────────────────────────────────────────────
-- FUTURE: Supabase Edge Functions + pg_cron for automated email reminders
-- ────────────────────────────────────────────────────────────────────────────
--
-- ── A. Renewal reminder emails (daily, 09:00 UTC) ───────────────────────────
--
-- Edge Function: supabase/functions/send-renewal-reminders/index.ts
--   1. Query checklist_items where renewal_date is within 30 days and
--      user has not been notified this renewal cycle.
--   2. Group by user_id; compose a "You have N renewals coming up" email
--      using Resend (or Supabase's SMTP settings):
--        Subject: "⚠️ Permit renewal due in 14 days — [Business Name]"
--        Body: list each expiring item with its renewal_date and a
--              "Renew Now" deep link to the RegBot chat with the business loaded.
--   3. Record notification_sent_at on each item to avoid repeat emails.
--
-- pg_cron schedule:
--   select cron.schedule(
--     'renewal-reminders',
--     '0 9 * * *',   -- daily at 09:00 UTC
--     $$
--       select net.http_post(
--         url     := 'https://<project>.supabase.co/functions/v1/send-renewal-reminders',
--         headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
--       )
--     $$
--   );
--
-- ── B. Rule change scan + alert emails (1st of each month, 10:00 UTC) ────────
--
-- Edge Function: supabase/functions/scan-rule-changes/index.ts
--   1. Fetch the monthly rule-change feed from Supabase Storage
--      (a JSON file maintained by the RegBot team, or a 3rd-party regulatory API).
--   2. For each active user, find businesses whose checklist contains form IDs
--      that appear in the rule-change feed.
--   3. Insert a row into rule_alerts for each match (ON CONFLICT DO NOTHING keeps
--      it idempotent within the same month).
--   4. Send a digest email:
--        Subject: "📋 New compliance update for [Business Name]"
--        Body: [Title] — [Description] — link to review in RegBot.
--
-- pg_cron schedule:
--   select cron.schedule(
--     'rule-change-scan',
--     '0 10 1 * *',  -- first day of each month at 10:00 UTC
--     $$
--       select net.http_post(
--         url     := 'https://<project>.supabase.co/functions/v1/scan-rule-changes',
--         headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
--       )
--     $$
--   );
--
-- ── C. Quarterly Compliance Check-in PDF (1st of Jan/Apr/Jul/Oct) ────────────
--
-- Edge Function: supabase/functions/quarterly-checkin/index.ts
--   1. For each Pro user, fetch their businesses + health scores from Supabase.
--   2. Generate a PDF using @react-pdf/renderer or puppeteer with:
--        - Business name + location
--        - Health score ring (SVG)
--        - Upcoming renewals within 90 days
--        - Recent rule change alerts (last 3 months)
--   3. Upload PDF to Supabase Storage (user-scoped bucket).
--   4. Email the download link:
--        Subject: "📊 Your Q[N] Compliance Check-in — [Business Name]"
--        Body: "Your quarterly compliance snapshot is ready. Download it here."
--
-- pg_cron schedule:
--   select cron.schedule(
--     'quarterly-checkin',
--     '0 8 1 1,4,7,10 *',   -- 1st of Jan, Apr, Jul, Oct at 08:00 UTC
--     $$
--       select net.http_post(
--         url     := 'https://<project>.supabase.co/functions/v1/quarterly-checkin',
--         headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
--       )
--     $$
--   );
-- ────────────────────────────────────────────────────────────────────────────
