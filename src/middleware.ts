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

// Build an absolute redirect URL from the browser-visible host (behind the preview proxy
// the internal Host differs from the origin the browser is on).
function redirectTo(request: NextRequest, path: string) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  const proto = request.headers.get('x-forwarded-proto') ?? 'http';
  return NextResponse.redirect(new URL(path, `${proto}://${host}`), 307);
}

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
    return redirectTo(request, `/login?next=${encodeURIComponent(pathname)}`);
  }

  // Agency routes require agency_admin role
  if (pathname.startsWith('/agency') && session.orgRole !== 'agency_admin') {
    return redirectTo(request, '/portal');
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
