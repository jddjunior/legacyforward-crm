'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAgency } from '@/lib/auth';
import { str, reqStr } from '@/lib/form';

const STAGES = [
  'proposal_sent', 'proposal_approved', 'payment_complete', 'account_created',
  'kickoff_complete', 'brand_uploaded', 'connections_linked', 'reviews_approved', 'active',
];

/** Agency creates a client org, its owner login, and gives agency admins access. */
export async function createClient(formData: FormData) {
  const session = await requireAgency();
  const name = reqStr(formData, 'name');
  const ownerEmail = str(formData, 'ownerEmail')?.toLowerCase();

  const org = await prisma.org.create({
    data: {
      name,
      website: str(formData, 'website'),
      contactName: str(formData, 'contactName'),
      onboardingStage: 'proposal_sent',
    },
  });

  await prisma.membership.create({ data: { userId: session.userId, orgId: org.id, role: 'agency_admin' } });

  if (ownerEmail) {
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {},
      create: { email: ownerEmail, name: str(formData, 'contactName') },
    });
    await prisma.membership.upsert({
      where: { userId_orgId: { userId: owner.id, orgId: org.id } },
      update: {},
      create: { userId: owner.id, orgId: org.id, role: 'owner' },
    });
  }
  revalidatePath('/agency/clients');
  revalidatePath('/agency');
}

/** Manual override of a client's onboarding stage. */
export async function setClientStage(orgId: string, formData: FormData) {
  await requireAgency();
  const stage = str(formData, 'stage');
  if (!stage || !STAGES.includes(stage)) return;
  await prisma.org.updateMany({ where: { id: orgId, isAgency: false }, data: { onboardingStage: stage } });
  revalidatePath('/agency/clients');
  revalidatePath('/agency');
}
