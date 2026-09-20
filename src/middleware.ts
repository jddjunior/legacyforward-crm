import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/pitch',
  '/api/auth',
  '/api/stripe-webhook',
  '/api/health',
  // Public pitch-to-pay gateway: approve a proposal and start checkout without a session
  '/api/proposals',
  '/api/payments',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get('lf-session')?.value);

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const location = `/login?next=${encodeURIComponent(pathname)}`;
    return new NextResponse(null, { status: 307, headers: { location } });
  }

  // Agency routes require agency_admin role
  if (pathname.startsWith('/agency') && session.orgRole !== 'agency_admin') {
    return new NextResponse(null, { status: 307, headers: { location: '/portal' } });
  }

  const response = NextResponse.next();
  response.headers.set('x-user-id', session.userId);
  response.headers.set('x-user-email', session.email);
  if (session.orgId) response.headers.set('x-org-id', session.orgId);
  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|support.js|uploads|.*\\.dc\\.html).*)'],
};
