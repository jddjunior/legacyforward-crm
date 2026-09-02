import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import { getOrigin } from '@/lib/origin';

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  const redirectUri = `${origin}/api/auth/callback`;

  const authUrl = workos.userManagement.getAuthorizationUrl({
    provider: 'authkit',
    clientId: process.env.WORKOS_CLIENT_ID || 'placeholder',
    redirectUri,
  });

  return NextResponse.redirect(authUrl);
}
