'use server';

import { revalidatePath } from 'next/cache';
import { forSession } from '@/lib/rls';
import { requireSession } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';

// Calendar items — approving schedules the post/flight, requesting
// changes flags it back to the agency.
export async function approvePost(id: string) {
  const session = await requireSession();
  const db = forSession(session);
  await db.socialPost.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'approved' },
  });
  await writeAudit(session, { action: 'approved', entity: 'SocialPost', entityId: id });
  revalidatePath('/portal/socials');
  revalidatePath('/portal/ads');
}

export async function requestPostChanges(id: string) {
  const session = await requireSession();
  const db = forSession(session);
  await db.socialPost.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'changes_requested' },
  });
  await writeAudit(session, { action: 'rejected', entity: 'SocialPost', entityId: id });
  revalidatePath('/portal/socials');
  revalidatePath('/portal/ads');
}
