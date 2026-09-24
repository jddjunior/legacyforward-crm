'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str, reqStr, int } from '@/lib/form';

const PATH = '/portal/reviews';

export async function addReview(formData: FormData) {
  const { orgId } = await requireOrg();
  const rating = Math.min(5, Math.max(1, int(formData, 'rating') ?? 5));
  await prisma.review.create({
    data: {
      orgId,
      source: str(formData, 'source') || 'google',
      author: reqStr(formData, 'author'),
      rating,
      content: str(formData, 'content'),
    },
  });
  revalidatePath(PATH);
}

export async function setReviewStatus(id: string, status: string) {
  const { orgId } = await requireOrg();
  await prisma.review.updateMany({ where: { id, orgId }, data: { status } });
  revalidatePath(PATH);
}

export async function deleteReview(id: string) {
  const { orgId } = await requireOrg();
  await prisma.review.deleteMany({ where: { id, orgId } });
  revalidatePath(PATH);
}
