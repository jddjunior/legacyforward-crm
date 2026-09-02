import { cookies } from 'next/headers';
import { verifySession, type SessionPayload } from '@/lib/session';

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('lf-session')?.value;
  return verifySession(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}
