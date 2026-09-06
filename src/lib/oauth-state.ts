import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'local-dev-only-not-for-production-32chars',
);

export interface OAuthState {
  /** Whether the user asked to stay signed in for 60 days. */
  remember: boolean;
}

/**
 * The "remember me" choice is made before the redirect to WorkOS and needs to
 * survive the round trip. It travels in the OAuth `state` parameter, signed so
 * the returning value is one we issued: `state` is attacker-supplyable on the
 * callback, and an unsigned flag would let anyone mint themselves a 60-day
 * session. Short-lived, because it is only in flight during a login.
 */
export async function signOAuthState(state: OAuthState): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ remember: state.remember })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60)
    .sign(secret);
}

/** Falls back to a normal-length session if the state is missing or invalid. */
export async function verifyOAuthState(token: string | null): Promise<OAuthState> {
  if (!token) return { remember: false };
  try {
    const { payload } = await jwtVerify(token, secret);
    return { remember: payload.remember === true };
  } catch {
    return { remember: false };
  }
}
