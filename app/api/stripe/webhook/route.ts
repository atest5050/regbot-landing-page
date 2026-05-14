// v285: Stripe webhook handler — updates profiles.is_pro on subscription events.
// Uses service role key so RLS does not block the update (no user session in webhook calls).
//
// checkout.session.completed resolution order:
//   1. session.metadata.userId      — set by /api/stripe/create-checkout-session (session flow)
//   2. session.client_reference_id  — set by openSubscribePage() when user is signed in (Payment Link flow)
//   3. session.customer_details.email lookup — fallback for guests who subscribe before signing in
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

// Service role client — bypasses RLS. Never expose this key to the browser.
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Resolve a Supabase user ID from a checkout session.
 * Tries metadata → client_reference_id → email lookup (in that order).
 */
async function resolveUserId(
  supabase: ReturnType<typeof adminClient>,
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  // 1. Session-based checkout (create-checkout-session route)
  if (session.metadata?.userId) return session.metadata.userId;

  // 2. Payment Link with signed-in user (client_reference_id = Supabase user ID)
  if (session.client_reference_id) return session.client_reference_id;

  // 3. Email fallback — guest subscribed before creating an account
  const email = session.customer_details?.email;
  if (!email) return null;

  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;
    const match = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (data.users.length < perPage) break;
    page++;
  }

  console.warn('[webhook] checkout.session.completed — could not resolve userId for email:', email);
  return null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set');
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? '', webhookSecret);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err);
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const supabase = adminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string | null;

        const userId = await resolveUserId(supabase, session);
        if (!userId || !customerId) {
          console.warn('[webhook] checkout.session.completed — skipped (userId or customerId missing)', {
            userId,
            customerId,
            sessionId: session.id,
          });
          break;
        }

        const { error } = await supabase.from('profiles').update({
          stripe_customer_id: customerId,
          subscription_status: 'active',
          is_pro: true,
        }).eq('id', userId);
        if (error) console.error('[webhook] checkout.session.completed update error:', error);
        else console.log('[webhook] checkout.session.completed — upgraded userId:', userId);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const { error } = await supabase.from('profiles').update({
          subscription_status: sub.status,
          is_pro: isActive,
        }).eq('stripe_customer_id', customerId);
        if (error) console.error('[webhook] subscription.updated error:', error);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const { error } = await supabase.from('profiles').update({
          subscription_status: 'canceled',
          is_pro: false,
        }).eq('stripe_customer_id', customerId);
        if (error) console.error('[webhook] subscription.deleted error:', error);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const { error } = await supabase.from('profiles').update({
          subscription_status: 'past_due',
          is_pro: false,
        }).eq('stripe_customer_id', customerId);
        if (error) console.error('[webhook] invoice.payment_failed error:', error);
        break;
      }
    }
  } catch (err) {
    console.error('[webhook] DB update error:', err);
  }

  return Response.json({ received: true });
}
