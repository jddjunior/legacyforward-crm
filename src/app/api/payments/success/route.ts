import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  const proposalId = request.nextUrl.searchParams.get('proposal_id');

  if (!sessionId || !proposalId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update payment record
      await prisma.payment.updateMany({
        where: { stripeSessionId: sessionId },
        data: { status: 'paid', stripePaymentIntentId: session.payment_intent as string },
      });

      // Advance org onboarding stage
      const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
      if (proposal) {
        await prisma.org.update({
          where: { id: proposal.orgId },
          data: { onboardingStage: 'payment_complete' },
        });
      }
    }

    return NextResponse.redirect(new URL('/portal?payment=success', request.url));
  } catch (err) {
    console.error('Payment success error:', err);
    return NextResponse.redirect(new URL('/?payment_error=1', request.url));
  }
}
