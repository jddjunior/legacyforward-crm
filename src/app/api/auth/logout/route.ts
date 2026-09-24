import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/cookie';

export async function POST() {
  // 303 turns the form POST into a GET; relative Location stays on the browser's host.
  const response = new NextResponse(null, { status: 303, headers: { location: '/login' } });
  // A partitioned cookie is only cleared when the same attributes are sent back.
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
