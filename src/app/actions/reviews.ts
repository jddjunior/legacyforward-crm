'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

// The approve → publish split from the design: approving clears a
// review for the site widget, publishing is what shows it there.
export async function approveReview(id: string) {
  const session = await requireSession();
  await prisma.review.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'approved' },
  });
  revalidatePath('/portal/reviews');
}

export async function publishReview(id: string) {
  const session = await requireSession();
  await prisma.review.updateMany({
    where: { id, orgId: session.orgId, status: 'approved' },
    data: { status: 'published' },
  });
  revalidatePath('/portal/reviews');
}
