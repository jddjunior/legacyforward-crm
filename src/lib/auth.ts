import { cookies } from 'next/headers';
import { verifySession, type SessionPayload } from '@/lib/session';
import { SESSION_COOKIE } from '@/lib/cookie';

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

/** Session guaranteed to be scoped to an org — use in portal server actions. */
export async function requireOrg(): Promise<SessionPayload & { orgId: string }> {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No organization selected');
  return session as SessionPayload & { orgId: string };
}

/** Agency admins work across every client org. */
export async function requireAgency(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.orgRole !== 'agency_admin') throw new Error('Forbidden');
  return session;
}
