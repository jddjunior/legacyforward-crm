import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { withIdempotency } from '@/lib/idempotency';
import { nextStage } from '@/lib/onboarding';

/**
 * Stripe webhook ingress (Build Plan Phase 1, §1.9).
 *
 * Payment truth comes from here, not from the browser returning to
 * /api/payments/success — a closed tab must not leave a paid customer stuck.
 * Every delivery is signature-verified and processed at most once.
 *
 * Uses the admin client deliberately: there is no session on a webhook, and
 * pre-account pitch payments have no tenant context yet.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set — refusing unverified webhook');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  // Signature verification needs the exact raw bytes, not a parsed body.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error('Stripe signature verification failed:', (err as Error).message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const outcome = await withIdempotency(
      { source: 'stripe', eventId: event.id, eventType: event.type },
      () => handleEvent(event),
    );
    return NextResponse.json({ received: true, duplicate: outcome.status === 'duplicate' });
  } catch (err) {
    console.error(`Stripe webhook ${event.type} failed:`, err);
    // 500 asks Stripe to retry; the idempotency claim was released.
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== 'paid') return;

      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: 'paid',
          stripePaymentIntentId: (session.payment_intent as string) ?? undefined,
        },
      });

      const orgId = await orgIdFor(session.metadata?.proposalId, session.customer as string | null);
      if (orgId) {
        await advanceStage(orgId, 'payment_complete');
        if (session.customer) {
          await prisma.org.update({
            where: { id: orgId },
            data: { stripeCustomerId: session.customer as string },
          });
        }
      }
      return;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const orgId = await orgIdForCustomer(invoice.customer as string | null);
      if (!orgId) return;

      await prisma.payment.create({
        data: {
          orgId,
          amount: invoice.amount_paid,
          type: 'subscription',
          status: 'paid',
          stripePaymentIntentId: (invoice.payment_intent as string) ?? undefined,
        },
      });
      await prisma.org.update({ where: { id: orgId }, data: { subscriptionStatus: 'active' } });
      return;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const orgId = await orgIdForCustomer(invoice.customer as string | null);
      if (!orgId) return;

      await prisma.payment.create({
        data: { orgId, amount: invoice.amount_due, type: 'subscription', status: 'failed' },
      });
      // Dunning lives in Phase 8; the retainer state is recorded now.
      await prisma.org.update({ where: { id: orgId }, data: { subscriptionStatus: 'past_due' } });
      return;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = await orgIdForCustomer(subscription.customer as string | null);
      if (!orgId) return;

      await prisma.org.update({
        where: { id: orgId },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus:
            event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status,
        },
      });
      return;
    }

    default:
      // Unhandled types are still recorded as processed, so Stripe stops retrying.
      return;
  }
}

async function orgIdFor(proposalId?: string, customerId?: string | null) {
  if (proposalId) {
    const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
    if (proposal) return proposal.orgId;
  }
  return orgIdForCustomer(customerId);
}

async function orgIdForCustomer(customerId?: string | null) {
  if (!customerId) return null;
  const org = await prisma.org.findFirst({ where: { stripeCustomerId: customerId } });
  return org?.id ?? null;
}

/** Never moves an org backwards, so a replayed event cannot un-onboard anyone. */
async function advanceStage(orgId: string, to: string) {
  const org = await prisma.org.findUnique({ where: { id: orgId } });
  if (!org) return;
  const target = nextStage(org.onboardingStage, to);
  if (target !== org.onboardingStage) {
    await prisma.org.update({ where: { id: orgId }, data: { onboardingStage: target } });
  }
}
