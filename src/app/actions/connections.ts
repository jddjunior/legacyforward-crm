'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str } from '@/lib/form';

const PATH = '/portal/connections';

/** Marks a provider connected with the account id the client supplied. */
export async function connectProvider(provider: string, formData: FormData) {
  const { orgId } = await requireOrg();
  const accountId = str(formData, 'accountId');
  await prisma.connection.upsert({
    where: { orgId_provider: { orgId, provider } },
    update: { status: 'connected', metadata: accountId ? { accountId } : undefined },
    create: { orgId, provider, status: 'connected', metadata: accountId ? { accountId } : undefined },
  });
  revalidatePath(PATH);
}

export async function disconnectProvider(provider: string) {
  const { orgId } = await requireOrg();
  await prisma.connection.deleteMany({ where: { orgId, provider } });
  revalidatePath(PATH);
}
