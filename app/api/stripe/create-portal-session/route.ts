// v285: real Stripe Customer Portal session.
// Receives { userId } → looks up stripe_customer_id → returns portal { url }.
import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth } from '@/lib/supabase/verify-pro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
  try {
    const caller = await verifyAuth(request);
    if (!caller) {
      return Response.json({ error: 'Authentication required' }, { status: 401, headers: CORS });
    }

    const { userId } = await request.json() as { userId?: string };
    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400, headers: CORS });
    }

    if (caller.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403, headers: CORS });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.reg-bot.ai';

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id as string | null;
    if (!customerId) {
      // Fallback: look up Stripe customer by email
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      if (email) {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          // Back-fill the column so next lookup is instant
          await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
        }
      }
      if (!customerId) {
        return Response.json({ error: 'No Stripe customer found for this account' }, { status: 404, headers: CORS });
      }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${baseUrl}/chat/`,
    });
    return Response.json({ url: session.url }, { headers: CORS });
  } catch (error) {
    console.error('[create-portal-session]', error);
    return Response.json({ error: 'Failed to create portal session' }, { status: 500, headers: CORS });
  }
}
