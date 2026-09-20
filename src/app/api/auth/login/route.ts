import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import { getOrigin } from '@/lib/origin';

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  const clientId = process.env.WORKOS_CLIENT_ID;

  if (!clientId || !process.env.WORKOS_API_KEY) {
    return NextResponse.redirect(new URL('/login?error=config', origin));
  }

  const next = request.nextUrl.searchParams.get('next') || '/portal';
  const email = request.nextUrl.searchParams.get('email') || undefined;

  const authUrl = workos.userManagement.getAuthorizationUrl({
    provider: 'authkit',
    clientId,
    redirectUri: `${origin}/api/auth/callback`,
    loginHint: email,
    state: Buffer.from(JSON.stringify({ next })).toString('base64url'),
  });

  return NextResponse.redirect(authUrl);
}
