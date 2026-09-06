'use server';

import { revalidatePath } from 'next/cache';
import { forSession } from '@/lib/rls';
import { requireSession } from '@/lib/auth';

export async function addLeadNote(id: string, formData: FormData) {
  const session = await requireSession();
  const db = forSession(session);
  const note = String(formData.get('note'));
  if (!note.trim()) return;

  const lead = await db.lead.findFirst({ where: { id, orgId: session.orgId } });
  if (!lead) return;

  await db.lead.update({
    where: { id },
    data: { notes: lead.notes ? `${lead.notes}\n\n[${new Date().toLocaleDateString()}] ${note}` : `[${new Date().toLocaleDateString()}] ${note}` },
  });
  revalidatePath(`/portal/leads/${id}`);
}
