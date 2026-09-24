import { prisma } from '@/lib/db';

const DEFAULT_BUILD_FEE_CENTS = 250000;

/** What a proposal costs — always priced server-side, never from the browser. */
export function buildFeeFor(proposal: { priceCents: number | null }) {
  return proposal.priceCents && proposal.priceCents > 0 ? proposal.priceCents : DEFAULT_BUILD_FEE_CENTS;
}

// Stages at or past payment; a late webhook must not move a client backwards.
const PAID_OR_LATER = [
  'payment_complete', 'account_created', 'kickoff_complete', 'brand_uploaded',
  'connections_linked', 'reviews_approved', 'active',
];

/** Idempotent: safe to call from both the success redirect and the Stripe webhook. */
export async function markCheckoutPaid(stripeSessionId: string, paymentIntentId: string | null) {
  const payment = await prisma.payment.findFirst({ where: { stripeSessionId } });
  if (!payment) return;

  if (payment.status !== 'paid') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'paid', stripePaymentIntentId: paymentIntentId },
    });
  }

  if (payment.orgId) {
    await prisma.org.updateMany({
      where: { id: payment.orgId, onboardingStage: { notIn: PAID_OR_LATER } },
      data: { onboardingStage: 'payment_complete' },
    });
  }
}

export async function markCheckoutFailed(stripeSessionId: string) {
  await prisma.payment.updateMany({
    where: { stripeSessionId, status: 'pending' },
    data: { status: 'failed' },
  });
}
