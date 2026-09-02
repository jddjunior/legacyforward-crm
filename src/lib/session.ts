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

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
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
