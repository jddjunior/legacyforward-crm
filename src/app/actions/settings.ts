'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str, reqStr } from '@/lib/form';
import { refreshSessionProfile } from './session';

const PATH = '/portal/settings';
const ROLES = ['owner', 'manager', 'viewer'];

async function requireManager() {
  const session = await requireOrg();
  if (!['owner', 'manager', 'agency_admin'].includes(session.orgRole || '')) {
    throw new Error('Only owners and managers can change organization settings');
  }
  return session;
}

export async function updateOrgProfile(formData: FormData) {
  const { orgId } = await requireManager();
  const brandColor = str(formData, 'brandColor');
  await prisma.org.update({
    where: { id: orgId },
    data: {
      name: reqStr(formData, 'name'),
      website: str(formData, 'website'),
      contactName: str(formData, 'contactName'),
      contactPhone: str(formData, 'contactPhone'),
      logoUrl: str(formData, 'logoUrl'),
      brandColor: brandColor && /^#[0-9a-f]{6}$/i.test(brandColor) ? brandColor : undefined,
    },
  });
  revalidatePath('/portal', 'layout');
}

export async function updateProfile(formData: FormData) {
  const { userId } = await requireOrg();
  await prisma.user.update({ where: { id: userId }, data: { name: str(formData, 'name') } });
  await refreshSessionProfile();
  revalidatePath('/portal', 'layout');
}

export async function inviteMember(formData: FormData) {
  const { orgId } = await requireManager();
  const email = reqStr(formData, 'email').toLowerCase();
  const role = ROLES.includes(str(formData, 'role') || '') ? str(formData, 'role')! : 'viewer';

  // They sign in with this email through WorkOS; the callback matches on email.
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: str(formData, 'name') },
  });
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: user.id, orgId } },
    update: { role },
    create: { userId: user.id, orgId, role },
  });
  revalidatePath(PATH);
}

export async function removeMember(membershipId: string) {
  const { orgId, userId } = await requireManager();
  const m = await prisma.membership.findFirst({ where: { id: membershipId, orgId } });
  if (!m || m.userId === userId) return; // can't remove yourself
  if (m.role === 'owner' && (await prisma.membership.count({ where: { orgId, role: 'owner' } })) <= 1) {
    throw new Error('An organization needs at least one owner');
  }
  await prisma.membership.delete({ where: { id: m.id } });
  revalidatePath(PATH);
}
