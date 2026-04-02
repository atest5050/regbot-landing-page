import Stripe from 'stripe';
import { NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const { formId, formName, formKey } = await request.json();

    if (!formId || !formName || !formKey) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `RegBot: ${formName}`,
              description:
                'AI-guided form preparation — your answers organized into a ready-to-submit PDF package with official submission instructions.',
            },
            unit_amount: 500, // $5.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment-success?form_key=${formKey}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/chat?cancelled=1`,
      metadata: { formId, formKey },
      custom_text: {
        submit: {
          message:
            'Your completed form PDF will download automatically after payment. Government filing fees are paid separately to the issuing agency.',
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
