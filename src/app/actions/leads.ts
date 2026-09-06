'use server';

import { revalidatePath } from 'next/cache';
import { forSession } from '@/lib/rls';
import { requireSession } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';

export async function createLead(formData: FormData) {
  const session = await requireSession();
  const db = forSession(session);
  if (!session.orgId) throw new Error('No org');

  await db.lead.create({
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
  const db = forSession(session);
  await db.lead.updateMany({
    where: { id, orgId: session.orgId },
    data: { status },
  });
  revalidatePath('/portal/leads');
}

export async function deleteLead(id: string) {
  const session = await requireSession();
  const db = forSession(session);
  await db.lead.deleteMany({ where: { id, orgId: session.orgId } });
  await writeAudit(session, { action: 'deleted', entity: 'Lead', entityId: id });
  revalidatePath('/portal/leads');
}
