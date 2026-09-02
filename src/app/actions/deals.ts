'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function createDeal(formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  await prisma.deal.create({
    data: {
      orgId: session.orgId,
      title: String(formData.get('title')),
      value: Math.round(Number(formData.get('value')) * 100),
      stage: String(formData.get('stage')) || 'lead',
    },
  });
  revalidatePath('/portal/pipeline');
}

export async function moveDeal(dealId: string, newStage: string) {
  const session = await requireSession();
  await prisma.deal.updateMany({
    where: { id: dealId, orgId: session.orgId },
    data: { stage: newStage },
  });
  revalidatePath('/portal/pipeline');
}

export async function deleteDeal(id: string) {
  const session = await requireSession();
  await prisma.deal.deleteMany({ where: { id, orgId: session.orgId } });
  revalidatePath('/portal/pipeline');
}
