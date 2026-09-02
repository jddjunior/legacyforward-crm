'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function approveItem(id: string) {
  const session = await requireSession();
  await prisma.approval.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'approved' },
  });
  revalidatePath('/portal/approvals');
}

export async function rejectItem(id: string) {
  const session = await requireSession();
  await prisma.approval.updateMany({
    where: { id, orgId: session.orgId },
    data: { status: 'rejected' },
  });
  revalidatePath('/portal/approvals');
}
