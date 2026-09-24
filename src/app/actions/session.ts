'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { signSession, type SessionPayload } from '@/lib/session';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/cookie';

async function writeSession(payload: SessionPayload) {
  cookies().set(SESSION_COOKIE, await signSession(payload), sessionCookieOptions());
}

/** Re-scope the session to another org the user belongs to (multi-org switching). */
export async function switchOrg(orgId: string, next?: string) {
  const session = await requireSession();
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.userId, orgId } },
    include: { org: true },
  });
  if (!membership) throw new Error('You are not a member of that organization');

  await writeSession({ ...session, orgId, orgRole: membership.role });
  redirect(next || (membership.org.isAgency ? '/agency' : '/portal'));
}

/** Form-friendly variant: `<select name="orgId">` inside a form. */
export async function switchOrgFromForm(formData: FormData) {
  const orgId = String(formData.get('orgId') || '');
  const next = String(formData.get('next') || '') || undefined;
  await switchOrg(orgId, next);
}

/** Refresh cached profile fields (e.g. after a name change). */
export async function refreshSessionProfile() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (user) await writeSession({ ...session, name: user.name || undefined });
}
