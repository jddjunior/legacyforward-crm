import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { getOrigin } from '@/lib/origin';

export async function POST(request: NextRequest) {
  try {
    const { proposalId, amount } = await request.json();

    const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
    if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });

    const origin = getOrigin(request);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${proposal.title} — Build Fee` },
            unit_amount: amount || 250000, // $2,500 default
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/api/payments/success?session_id={CHECKOUT_SESSION_ID}&proposal_id=${proposalId}`,
      cancel_url: `${origin}/pitch/${proposal.token}?canceled=1`,
      metadata: { proposalId },
    });

    await prisma.payment.create({
      data: {
        proposalId,
        orgId: proposal.orgId,
        stripeSessionId: session.id,
        amount: amount || 250000,
        type: 'one_time',
        status: 'pending',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
