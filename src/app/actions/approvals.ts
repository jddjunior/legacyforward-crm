'use server';

import { revalidatePath } from 'next/cache';
import { forSession } from '@/lib/rls';
import { requireSession } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';

export async function approveItem(id: string) {
  const session = await requireSession();
  const db = forSession(session);
  await db.approval.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'approved' },
  });
  await writeAudit(session, { action: 'approved', entity: 'Approval', entityId: id });
  revalidatePath('/portal/approvals');
}

export async function rejectItem(id: string) {
  const session = await requireSession();
  const db = forSession(session);
  await db.approval.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'rejected' },
  });
  await writeAudit(session, { action: 'rejected', entity: 'Approval', entityId: id });
  revalidatePath('/portal/approvals');
}
