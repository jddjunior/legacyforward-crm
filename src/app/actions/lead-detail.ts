'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function addLeadNote(id: string, formData: FormData) {
  const session = await requireSession();
  const note = String(formData.get('note'));
  if (!note.trim()) return;

  const lead = await prisma.lead.findFirst({ where: { id, orgId: session.orgId } });
  if (!lead) return;

  await prisma.lead.update({
    where: { id },
    data: { notes: lead.notes ? `${lead.notes}\n\n[${new Date().toLocaleDateString()}] ${note}` : `[${new Date().toLocaleDateString()}] ${note}` },
  });
  revalidatePath(`/portal/leads/${id}`);
}
