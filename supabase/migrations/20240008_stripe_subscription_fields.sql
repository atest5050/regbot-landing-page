-- vUnified-20260414-national-expansion-v86
-- Add Stripe subscription fields to the profiles table.
--
--   subscription_status  — mirrors the Stripe subscription status string:
--                          'active' | 'trialing' | 'past_due' | 'canceled' | NULL (never subscribed)
--   stripe_customer_id   — the Stripe Customer object ID (cus_…).
--                          Set by the webhook on checkout.session.completed and
--                          used by create-portal-session to open the billing portal.
--
-- Safe to run multiple times (IF NOT EXISTS / IF NOT EXISTS guards).
-- All columns are nullable so existing rows are unaffected.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id  TEXT;

COMMENT ON COLUMN public.profiles.subscription_status IS
  'Stripe subscription status: active, trialing, past_due, canceled, or NULL (no subscription yet). '
  'Set by the Stripe webhook handler (app/api/stripe/webhook/route.ts).';

COMMENT ON COLUMN public.profiles.stripe_customer_id IS
  'Stripe Customer ID (cus_…). Used by create-portal-session to open the Stripe Billing Portal. '
  'Set by the webhook on checkout.session.completed.';

-- Index for fast webhook lookups by customer ID
-- (customer.subscription.updated / customer.subscription.deleted / invoice events).
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
