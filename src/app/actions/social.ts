'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str, reqStr, date } from '@/lib/form';

const PATH = '/portal/socials';

export async function createPost(formData: FormData) {
  const { orgId } = await requireOrg();
  await prisma.socialPost.create({
    data: {
      orgId,
      platform: str(formData, 'platform') || 'facebook',
      content: reqStr(formData, 'content'),
      scheduledAt: date(formData, 'scheduledAt') ?? new Date(),
      status: str(formData, 'status') || 'draft',
    },
  });
  revalidatePath(PATH);
}

export async function setPostStatus(id: string, status: string) {
  const { orgId } = await requireOrg();
  await prisma.socialPost.updateMany({ where: { id, orgId }, data: { status } });
  revalidatePath(PATH);
}

/** Send a draft to the Approvals queue so the owner can sign off before it's scheduled. */
export async function requestPostApproval(id: string) {
  const { orgId } = await requireOrg();
  const post = await prisma.socialPost.findFirst({ where: { id, orgId } });
  if (!post) return;
  await prisma.approval.create({
    data: {
      orgId,
      type: 'social',
      title: `${post.platform[0].toUpperCase()}${post.platform.slice(1)} post — ${post.content.slice(0, 60)}`,
      content: { socialPostId: post.id, content: post.content, scheduledAt: post.scheduledAt.toISOString() },
    },
  });
  revalidatePath(PATH);
  revalidatePath('/portal/approvals');
}

export async function deletePost(id: string) {
  const { orgId } = await requireOrg();
  await prisma.socialPost.deleteMany({ where: { id, orgId } });
  revalidatePath(PATH);
}
