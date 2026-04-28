-- Migration: 20240009_anon_chat_usage
-- Tracks AI chat usage for unauthenticated visitors by hashed IP.
-- Used to enforce the 3-chats-per-30-days free limit before the sign-in wall.

CREATE TABLE IF NOT EXISTS public.anon_chat_usage (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anon_chat_ip_hash    ON public.anon_chat_usage(ip_hash);
CREATE INDEX IF NOT EXISTS idx_anon_chat_created_at ON public.anon_chat_usage(created_at);

-- Prune rows older than 35 days to keep the table small.
-- Run manually or via a Supabase cron edge function:
--   DELETE FROM public.anon_chat_usage WHERE created_at < NOW() - INTERVAL '35 days';

ALTER TABLE public.anon_chat_usage ENABLE ROW LEVEL SECURITY;

-- Server (anon key) may INSERT new events — the ip_hash is a server-side SHA-256
-- of the real IP; clients never supply or control it.
CREATE POLICY "anon_chat_insert" ON public.anon_chat_usage
  FOR INSERT TO anon WITH CHECK (true);

-- Server (anon key) may SELECT to count events for rate-limit checking.
CREATE POLICY "anon_chat_select" ON public.anon_chat_usage
  FOR SELECT TO anon USING (true);

-- No UPDATE or DELETE for the anon role — prevents users from clearing their own count.
