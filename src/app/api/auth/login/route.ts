import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import { getOrigin } from '@/lib/origin';
import { signOAuthState } from '@/lib/oauth-state';

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  const redirectUri = `${origin}/api/auth/callback`;

  // The checkbox is on our sign-in screen, so the choice has to be carried
  // through the WorkOS redirect in a signed `state` value.
  const remember = request.nextUrl.searchParams.get('remember') === '1';

  const authUrl = workos.userManagement.getAuthorizationUrl({
    provider: 'authkit',
    clientId: process.env.WORKOS_CLIENT_ID || 'placeholder',
    redirectUri,
    state: await signOAuthState({ remember }),
  });

  return NextResponse.redirect(authUrl);
}
