'use server';

import { revalidatePath } from 'next/cache';
import { forSession } from '@/lib/rls';
import { requireSession } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';

export async function createCustomer(formData: FormData) {
  const session = await requireSession();
  const db = forSession(session);
  if (!session.orgId) throw new Error('No org');

  await db.customer.create({
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
  const db = forSession(session);
  await db.customer.deleteMany({ where: { id, orgId: session.orgId } });
  await writeAudit(session, { action: 'deleted', entity: 'Customer', entityId: id });
  revalidatePath('/portal/customers');
}
