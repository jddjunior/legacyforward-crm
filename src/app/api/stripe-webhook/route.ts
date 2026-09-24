import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { markCheckoutPaid, markCheckoutFailed } from '@/lib/payments';

/**
 * Stripe → app payment status sync. Point a Stripe webhook endpoint at
 * `/api/stripe-webhook` with the checkout.session.* events and set STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch (err) {
    console.error('Stripe webhook signature failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      if (session.payment_status === 'paid') {
        await markCheckoutPaid(session.id, (session.payment_intent as string) || null);
      }
      break;
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired':
      await markCheckoutFailed(session.id);
      break;
  }

  return NextResponse.json({ received: true });
}
