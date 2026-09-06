'use server';

import { revalidatePath } from 'next/cache';
import { requireActiveOrg } from '@/lib/gate';
import { writeAudit } from '@/lib/audit';

export const DEAL_STAGES = ['lead', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const;

export async function createDeal(formData: FormData) {
  const { session, db } = await requireActiveOrg();

  const stage = String(formData.get('stage') || 'lead');
  if (!DEAL_STAGES.includes(stage as (typeof DEAL_STAGES)[number])) {
    throw new Error(`Unknown deal stage: ${stage}`);
  }

  const deal = await db.deal.create({
    data: {
      orgId: session.orgId!,
      title: String(formData.get('title')),
      value: Math.round(Number(formData.get('value')) * 100),
      stage,
    },
  });

  // Opening position, so a deal's history starts at creation rather than at its
  // first drag.
  await db.dealStageEvent.create({
    data: { orgId: session.orgId!, dealId: deal.id, toStage: stage, userId: session.userId },
  });
  await writeAudit(session, { action: 'created', entity: 'Deal', entityId: deal.id });
  revalidatePath('/portal/pipeline');
}

export async function moveDeal(dealId: string, newStage: string) {
  const { session, db } = await requireActiveOrg();

  if (!DEAL_STAGES.includes(newStage as (typeof DEAL_STAGES)[number])) {
    throw new Error(`Unknown deal stage: ${newStage}`);
  }

  // Read through RLS first: this both scopes the write to the tenant and gives
  // us the from-stage for the history row.
  const deal = await db.deal.findFirst({ where: { id: dealId, orgId: session.orgId! } });
  if (!deal) throw new Error('Deal not found');
  if (deal.stage === newStage) return;

  await db.deal.update({ where: { id: deal.id }, data: { stage: newStage } });
  await db.dealStageEvent.create({
    data: {
      orgId: session.orgId!,
      dealId: deal.id,
      fromStage: deal.stage,
      toStage: newStage,
      userId: session.userId,
    },
  });
  await writeAudit(session, {
    action: 'stage_changed',
    entity: 'Deal',
    entityId: deal.id,
    metadata: { from: deal.stage, to: newStage },
  });
  revalidatePath('/portal/pipeline');
}

export async function deleteDeal(id: string) {
  const { session, db } = await requireActiveOrg();
  await db.deal.deleteMany({ where: { id, orgId: session.orgId! } });
  await writeAudit(session, { action: 'deleted', entity: 'Deal', entityId: id });
  revalidatePath('/portal/pipeline');
}
