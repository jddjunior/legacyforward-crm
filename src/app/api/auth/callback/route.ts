import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import { prisma } from '@/lib/db';
import { signSession } from '@/lib/session';
import { getOrigin } from '@/lib/origin';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/', request.url));

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

    const sessionToken = await signSession({
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || undefined,
      orgId: firstMembership?.orgId,
      orgRole: firstMembership?.role,
    });

    const response = NextResponse.redirect(new URL('/portal', getOrigin(request)));
    response.cookies.set('lf-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.redirect(new URL('/?auth_error=1', getOrigin(request)));
  }
}
