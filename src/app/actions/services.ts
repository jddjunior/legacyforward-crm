'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str, reqStr, cents } from '@/lib/form';

const PATH = '/portal/services';

export async function createService(formData: FormData) {
  const { orgId } = await requireOrg();
  await prisma.service.create({
    data: {
      orgId,
      name: reqStr(formData, 'name'),
      description: str(formData, 'description'),
      price: cents(formData, 'price') ?? 0,
      cost: cents(formData, 'cost'),
    },
  });
  revalidatePath(PATH);
}

export async function toggleService(id: string) {
  const { orgId } = await requireOrg();
  const svc = await prisma.service.findFirst({ where: { id, orgId } });
  if (!svc) return;
  await prisma.service.update({ where: { id }, data: { active: !svc.active } });
  revalidatePath(PATH);
}

export async function deleteService(id: string) {
  const { orgId } = await requireOrg();
  await prisma.service.deleteMany({ where: { id, orgId } });
  revalidatePath(PATH);
}
