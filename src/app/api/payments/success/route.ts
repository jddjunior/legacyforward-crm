import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getOrigin } from '@/lib/origin';
import { markCheckoutPaid } from '@/lib/payments';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) return NextResponse.redirect(new URL('/', getOrigin(request)));

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      await markCheckoutPaid(session.id, (session.payment_intent as string) || null);
    }
    return NextResponse.redirect(new URL('/portal?payment=success', getOrigin(request)));
  } catch (err) {
    console.error('Payment success error:', err);
    return NextResponse.redirect(new URL('/?payment_error=1', getOrigin(request)));
  }
}
