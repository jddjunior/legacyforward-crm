import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import CustomersView from '@/components/portal/CustomersView';

export default async function CustomersPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const dbCustomers = await prisma.customer.findMany({ where: { orgId: session.orgId }, orderBy: { createdAt: 'desc' } });

  const custRaw = dbCustomers.map(c => ({
    company: c.name,
    contact: c.email || c.phone || '—',
    serviceLine: c.address || '—',
    since: c.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    health: 'Healthy',
    kind: 'good',
    value: c.value || 0,
    note: c.address || '',
  }));

  return (
    <>
      <Header title="Customers" desc="Won accounts, contract value, account health" pendingCount={0} />
      <RouteShell>
        <CustomersView customers={custRaw} />
      </RouteShell>
    </>
  );
}
