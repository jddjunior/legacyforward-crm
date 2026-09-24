'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

async function decide(id: string, status: 'approved' | 'rejected') {
  const session = await requireSession();
  // Agency admins act on the cross-client queue; everyone else only on their own org.
  const scope = session.orgRole === 'agency_admin' ? { id } : { id, orgId: session.orgId };
  const approval = await prisma.approval.findFirst({ where: scope });
  if (!approval) return;

  await prisma.approval.update({ where: { id: approval.id }, data: { status } });

  // Approved social posts move straight onto the calendar.
  const postId = (approval.content as { socialPostId?: string } | null)?.socialPostId;
  if (postId) {
    await prisma.socialPost.updateMany({
      where: { id: postId, orgId: approval.orgId },
      data: { status: status === 'approved' ? 'scheduled' : 'draft' },
    });
    revalidatePath('/portal/socials');
  }

  revalidatePath('/portal/approvals');
  revalidatePath('/portal');
  revalidatePath('/agency/approvals');
  revalidatePath('/agency');
}

export async function approveItem(id: string) {
  await decide(id, 'approved');
}

export async function rejectItem(id: string) {
  await decide(id, 'rejected');
}
