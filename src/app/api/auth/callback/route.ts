import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import { prisma } from '@/lib/db';
import { signSession, verifySession, REMEMBER_ME_TTL_SECONDS, SESSION_TTL_SECONDS } from '@/lib/session';
import { verifyOAuthState } from '@/lib/oauth-state';
import { getOrigin } from '@/lib/origin';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/', request.url));

  // Signed by us before the redirect; an unverifiable state means a normal session.
  const { remember } = await verifyOAuthState(request.nextUrl.searchParams.get('state'));
  const ttlSeconds = remember ? REMEMBER_ME_TTL_SECONDS : SESSION_TTL_SECONDS;

  try {
    const { user, sealedSession } = await workos.userManagement.authenticateWithCode({
      code,
      clientId: process.env.WORKOS_CLIENT_ID || 'placeholder',
    });

    // Find or create user in DB
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
          workosUserId: user.id,
        },
      });
    } else if (!dbUser.workosUserId) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { workosUserId: user.id },
      });
    }

    // Find memberships
    const memberships = await prisma.membership.findMany({
      where: { userId: dbUser.id },
      include: { org: true },
    });

    const firstMembership = memberships[0];

    const sessionToken = await signSession(
      {
        userId: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || undefined,
        orgId: firstMembership?.orgId,
        orgRole: firstMembership?.role,
      },
      ttlSeconds,
    );

    const response = NextResponse.redirect(new URL('/portal', getOrigin(request)));
    // SameSite=None + Secure is required for the session cookie to be sent
    // when the app runs inside an embedded iframe preview (third-party context).
    response.cookies.set('lf-session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      // Same ttl as the token itself, so cookie and session expire together.
      maxAge: ttlSeconds,
    });
    return response;
  } catch (err) {
    // An authorization code is single-use, and browsers replay this URL for
    // reasons outside our control (back button, refresh, link prefetch, a
    // duplicated request). The first exchange already signed the user in, so
    // treat a replay as success when a valid session cookie is present rather
    // than throwing an already-authenticated user back to an error screen.
    const existing = await verifySession(request.cookies.get('lf-session')?.value);
    if (existing) {
      return NextResponse.redirect(new URL('/portal', getOrigin(request)));
    }

    console.error('Auth callback error:', err);
    return NextResponse.redirect(new URL('/?auth_error=1', getOrigin(request)));
  }
}
