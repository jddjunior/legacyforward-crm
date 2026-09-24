'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str, reqStr, int } from '@/lib/form';

const PATH = '/portal/live-calls';

export async function logCall(formData: FormData) {
  const { orgId } = await requireOrg();
  const minutes = int(formData, 'minutes') ?? 0;
  await prisma.call.create({
    data: {
      orgId,
      callerName: str(formData, 'callerName'),
      callerNumber: reqStr(formData, 'callerNumber'),
      durationSec: minutes * 60,
      status: str(formData, 'status') || 'answered',
      source: str(formData, 'source'),
      notes: str(formData, 'notes'),
    },
  });
  revalidatePath(PATH);
}

/** Create a CRM lead from a call and link them. */
export async function convertCallToLead(id: string) {
  const { orgId } = await requireOrg();
  const call = await prisma.call.findFirst({ where: { id, orgId } });
  if (!call || call.leadId) return;
  const lead = await prisma.lead.create({
    data: {
      orgId,
      name: call.callerName || call.callerNumber,
      phone: call.callerNumber,
      source: 'call',
      notes: call.notes,
    },
  });
  await prisma.call.update({ where: { id }, data: { leadId: lead.id } });
  revalidatePath(PATH);
  revalidatePath('/portal/leads');
}

export async function deleteCall(id: string) {
  const { orgId } = await requireOrg();
  await prisma.call.deleteMany({ where: { id, orgId } });
  revalidatePath(PATH);
}
