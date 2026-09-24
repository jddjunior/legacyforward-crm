import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import { prisma } from '@/lib/db';
import { signSession } from '@/lib/session';
import { getOrigin } from '@/lib/origin';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/cookie';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?error=auth', getOrigin(request)));

  let next = '/portal';
  const state = request.nextUrl.searchParams.get('state');
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString());
      if (typeof parsed.next === 'string' && parsed.next.startsWith('/')) next = parsed.next;
    } catch {
      // ignore malformed state
    }
  }

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

    // Agency staff also belong to every client org; land them in the agency first.
    const firstMembership = memberships.find((m) => m.org.isAgency) || memberships[0];

    const sessionToken = await signSession({
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || undefined,
      orgId: firstMembership?.orgId,
      orgRole: firstMembership?.role,
    });

    const destination =
      firstMembership?.role === 'agency_admin' && next === '/portal' ? '/agency' : next;
    const response = new NextResponse(null, { status: 307, headers: { location: destination } });
    response.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
    return response;
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=auth', getOrigin(request)));
  }
}
