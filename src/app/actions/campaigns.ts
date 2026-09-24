'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str, reqStr, int, cents, date } from '@/lib/form';

const PATH = '/portal/ads';

export async function createCampaign(formData: FormData) {
  const { orgId } = await requireOrg();
  await prisma.campaign.create({
    data: {
      orgId,
      name: reqStr(formData, 'name'),
      platform: str(formData, 'platform') || 'google_ads',
      budgetCents: cents(formData, 'budget') ?? 0,
      startDate: date(formData, 'startDate'),
      endDate: date(formData, 'endDate'),
      status: 'draft',
    },
  });
  revalidatePath(PATH);
}

export async function setCampaignStatus(id: string, status: string) {
  const { orgId } = await requireOrg();
  await prisma.campaign.updateMany({ where: { id, orgId }, data: { status } });
  revalidatePath(PATH);
}

export async function updateCampaignStats(id: string, formData: FormData) {
  const { orgId } = await requireOrg();
  await prisma.campaign.updateMany({
    where: { id, orgId },
    data: {
      spendCents: cents(formData, 'spend') ?? undefined,
      clicks: int(formData, 'clicks') ?? undefined,
      leads: int(formData, 'leads') ?? undefined,
    },
  });
  revalidatePath(PATH);
}

export async function deleteCampaign(id: string) {
  const { orgId } = await requireOrg();
  await prisma.campaign.deleteMany({ where: { id, orgId } });
  revalidatePath(PATH);
}
