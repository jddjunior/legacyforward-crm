'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function createCustomer(formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  await prisma.customer.create({
    data: {
      orgId: session.orgId,
      name: String(formData.get('name')),
      email: String(formData.get('email')) || null,
      phone: String(formData.get('phone')) || null,
      address: String(formData.get('address')) || null,
      value: Number(formData.get('value')) ? Math.round(Number(formData.get('value')) * 100) : null,
    },
  });
  revalidatePath('/portal/customers');
}

export async function deleteCustomer(id: string) {
  const session = await requireSession();
  await prisma.customer.deleteMany({ where: { id, orgId: session.orgId } });
  revalidatePath('/portal/customers');
}
