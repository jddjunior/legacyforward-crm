import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signSession } from '@/lib/session';
import { getOrigin } from '@/lib/origin';

/**
 * Development-only sign-in: creates a session cookie for a seeded user without
 * WorkOS. Disabled in production.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const email = request.nextUrl.searchParams.get('email') || 'priya@lanternfield.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: { include: { org: true } } },
  });
  if (!user) return NextResponse.json({ error: `No user ${email}` }, { status: 404 });

  const membership =
    user.memberships.find((m) => m.org.isAgency) || user.memberships[0];

  const token = await signSession({
    userId: user.id,
    email: user.email,
    name: user.name || undefined,
    orgId: membership?.orgId,
    orgRole: membership?.role,
  });

  const target = request.nextUrl.searchParams.get('next') || '/portal';
  const response = NextResponse.redirect(new URL(target, getOrigin(request)));
  response.cookies.set('lf-session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
