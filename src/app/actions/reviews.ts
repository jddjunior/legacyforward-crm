'use server';

import { revalidatePath } from 'next/cache';
import { forSession } from '@/lib/rls';
import { requireSession } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';

// The approve → publish split from the design: approving clears a
// review for the site widget, publishing is what shows it there.
export async function approveReview(id: string) {
  const session = await requireSession();
  const db = forSession(session);
  await db.review.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'approved' },
  });
  await writeAudit(session, { action: 'approved', entity: 'Review', entityId: id });
  revalidatePath('/portal/reviews');
}

export async function publishReview(id: string) {
  const session = await requireSession();
  const db = forSession(session);
  await db.review.updateMany({
    where: { id, orgId: session.orgId, status: 'approved' },
    data: { status: 'published' },
  });
  await writeAudit(session, { action: 'updated', entity: 'Review', entityId: id, metadata: { published: true } });
  revalidatePath('/portal/reviews');
}
