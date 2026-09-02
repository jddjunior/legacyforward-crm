import { NextResponse } from 'next/server';
import { getOrigin } from '@/lib/origin';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', getOrigin(request)));
  response.cookies.delete('lf-session');
  return response;
}
