'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

// Calendar items — approving schedules the post/flight, requesting
// changes flags it back to the agency.
export async function approvePost(id: string) {
  const session = await requireSession();
  await prisma.socialPost.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'approved' },
  });
  revalidatePath('/portal/socials');
  revalidatePath('/portal/ads');
}

export async function requestPostChanges(id: string) {
  const session = await requireSession();
  await prisma.socialPost.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'changes_requested' },
  });
  revalidatePath('/portal/socials');
  revalidatePath('/portal/ads');
}
