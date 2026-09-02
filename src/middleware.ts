import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const PUBLIC_PATHS = ['/', '/pitch', '/api/auth', '/api/stripe-webhook', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get('lf-session')?.value);

  if (!session) {
    const loginUrl = new URL('/api/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Agency routes require agency_admin role
  if (pathname.startsWith('/agency') && session.orgRole !== 'agency_admin') {
    return NextResponse.redirect(new URL('/portal', request.url));
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
