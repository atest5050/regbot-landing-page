import Stripe from 'stripe';
import { NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return Response.json({ paid: false, error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return Response.json({
      paid: session.payment_status === 'paid',
      formId: session.metadata?.formId ?? null,
      formKey: session.metadata?.formKey ?? null,
    });
  } catch (error: any) {
    console.error('Stripe verify error:', error);
    return Response.json({ paid: false, error: 'Failed to verify session' }, { status: 500 });
  }
}
