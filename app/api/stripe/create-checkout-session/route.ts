// v285: real Stripe subscription checkout session.
// Receives { userId } → creates Stripe Checkout in subscription mode → returns { url }.
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

    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      console.error('[create-checkout-session] STRIPE_PRO_PRICE_ID not set');
      return Response.json({ error: 'Subscription pricing not configured' }, { status: 500, headers: CORS });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://regbot-landing-page.vercel.app';

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    const params: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/chat/?success=true`,
      cancel_url:  `${baseUrl}/chat/?cancelled=1`,
      metadata: { userId },
    };
    if (profile?.stripe_customer_id) {
      params.customer = profile.stripe_customer_id as string;
    } else if (profile?.email) {
      params.customer_email = profile.email as string;
    }

    const session = await stripe.checkout.sessions.create(params);
    return Response.json({ url: session.url }, { headers: CORS });
  } catch (error) {
    console.error('[create-checkout-session]', error);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500, headers: CORS });
  }
}
