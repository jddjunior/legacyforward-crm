'use server';

import { revalidatePath } from 'next/cache';
import { forSession } from '@/lib/rls';
import { requireSession } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';

export async function createDeal(formData: FormData) {
  const session = await requireSession();
  const db = forSession(session);
  if (!session.orgId) throw new Error('No org');

  await db.deal.create({
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
  const db = forSession(session);
  await db.deal.updateMany({
    where: { id: dealId, orgId: session.orgId },
    data: { stage: newStage },
  });
  revalidatePath('/portal/pipeline');
}

export async function deleteDeal(id: string) {
  const session = await requireSession();
  const db = forSession(session);
  await db.deal.deleteMany({ where: { id, orgId: session.orgId } });
  await writeAudit(session, { action: 'deleted', entity: 'Deal', entityId: id });
  revalidatePath('/portal/pipeline');
}
