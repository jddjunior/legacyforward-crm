'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str, reqStr } from '@/lib/form';

const PATH = '/portal/website';

export async function createSiteRequest(formData: FormData) {
  const { orgId } = await requireOrg();
  await prisma.siteRequest.create({
    data: {
      orgId,
      page: reqStr(formData, 'page'),
      request: reqStr(formData, 'request'),
      priority: str(formData, 'priority') || 'normal',
    },
  });
  revalidatePath(PATH);
}

export async function setSiteRequestStatus(id: string, status: string) {
  const { orgId } = await requireOrg();
  await prisma.siteRequest.updateMany({ where: { id, orgId }, data: { status } });
  revalidatePath(PATH);
}

export async function deleteSiteRequest(id: string) {
  const { orgId } = await requireOrg();
  await prisma.siteRequest.deleteMany({ where: { id, orgId } });
  revalidatePath(PATH);
}

export async function updateWebsiteUrl(formData: FormData) {
  const { orgId } = await requireOrg();
  await prisma.org.update({ where: { id: orgId }, data: { website: str(formData, 'website') } });
  revalidatePath(PATH);
}
