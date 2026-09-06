import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'local-dev-only-not-for-production-32chars'
);

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string;
  orgId?: string;
  orgRole?: string;
}

/** Default session lifetime. */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

/** "Remember me for 60 days" lifetime. */
export const REMEMBER_ME_TTL_SECONDS = 60 * 24 * 60 * 60;

/**
 * The JWT expiry and the cookie's maxAge are always set from the SAME ttl.
 * If the cookie outlived the token the user would be silently logged out with
 * a cookie still present; if the token outlived the cookie, a stolen token
 * would stay valid longer than intended.
 */
export async function signSession(
  payload: SessionPayload,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(secret);
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
