'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function createLead(formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  await prisma.lead.create({
    data: {
      orgId: session.orgId,
      name: String(formData.get('name')),
      email: String(formData.get('email')) || null,
      phone: String(formData.get('phone')) || null,
      source: String(formData.get('source')) || null,
      notes: String(formData.get('notes')) || null,
    },
  });
  revalidatePath('/portal/leads');
}

export async function updateLeadStatus(id: string, status: string) {
  const session = await requireSession();
  await prisma.lead.updateMany({
    where: { id, orgId: session.orgId },
    data: { status },
  });
  revalidatePath('/portal/leads');
}

export async function deleteLead(id: string) {
  const session = await requireSession();
  await prisma.lead.deleteMany({ where: { id, orgId: session.orgId } });
  revalidatePath('/portal/leads');
}
