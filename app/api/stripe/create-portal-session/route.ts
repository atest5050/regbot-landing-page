// v285: real Stripe Customer Portal session.
// Receives { userId } → looks up stripe_customer_id → returns portal { url }.
import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const { userId } = await request.json() as { userId?: string };
    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400, headers: CORS });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://regbot-landing-page.vercel.app';

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    const customerId = profile?.stripe_customer_id as string | null;
    if (!customerId) {
      return Response.json({ error: 'No Stripe customer found for this account' }, { status: 404, headers: CORS });
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
