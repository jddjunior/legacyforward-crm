import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback`;

  const authUrl = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID || 'placeholder',
    redirectUri,
  });

  return NextResponse.redirect(authUrl);
}
