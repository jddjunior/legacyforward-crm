'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str, reqStr, int } from '@/lib/form';

const PATH = '/portal/seo';

export async function createKeyword(formData: FormData) {
  const { orgId } = await requireOrg();
  const term = reqStr(formData, 'term').toLowerCase();
  await prisma.keyword.upsert({
    where: { orgId_term: { orgId, term } },
    update: {},
    create: {
      orgId,
      term,
      targetUrl: str(formData, 'targetUrl'),
      volume: int(formData, 'volume'),
      position: int(formData, 'position'),
    },
  });
  revalidatePath(PATH);
}

/** Record a new rank check; the old position becomes the comparison point. */
export async function updateKeywordRank(id: string, formData: FormData) {
  const { orgId } = await requireOrg();
  const kw = await prisma.keyword.findFirst({ where: { id, orgId } });
  if (!kw) return;
  await prisma.keyword.update({
    where: { id },
    data: { previousPosition: kw.position, position: int(formData, 'position') },
  });
  revalidatePath(PATH);
}

export async function deleteKeyword(id: string) {
  const { orgId } = await requireOrg();
  await prisma.keyword.deleteMany({ where: { id, orgId } });
  revalidatePath(PATH);
}
