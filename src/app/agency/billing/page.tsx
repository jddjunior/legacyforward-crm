import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import StatGrid from '@/components/agency/StatGrid';
import Panel from '@/components/agency/Panel';
import DataTable from '@/components/agency/DataTable';
import { badgeClass, humanize, money, shortDate } from '@/lib/format';
import { CreditCard, CircleDollarSign, Clock, Building2 } from 'lucide-react';

export default async function AgencyBillingPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [payments, clients] = await Promise.all([
    prisma.payment.findMany({ include: { org: true, proposal: true }, orderBy: { createdAt: 'desc' } }),
    prisma.org.findMany({ where: { isAgency: false }, orderBy: { name: 'asc' } }),
  ]);

  const collected = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const outstanding = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const onStripe = clients.filter((c) => c.stripeCustomerId).length;

  return (
    <>
      <PageHeader title="Billing" desc="Build fees, subscriptions, and who still owes you money" />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Collected', value: money(collected), icon: CircleDollarSign },
            { label: 'Outstanding', value: money(outstanding), icon: Clock },
            { label: 'Transactions', value: String(payments.length), icon: CreditCard },
            { label: 'Billable Clients', value: `${onStripe}/${clients.length}`, icon: Building2 },
          ]}
        />
        <div className="px-[26px] pt-[18px] grid gap-4 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
          <Panel title="Transactions">
            <DataTable
              rows={payments}
              empty="No payments recorded yet."
              columns={[
                { header: 'Client', cell: (p) => p.org?.name ?? '—', className: 'font-medium text-[#14141a]' },
                { header: 'For', cell: (p) => p.proposal?.title ?? humanize(p.type) },
                { header: 'Amount', cell: (p) => <span className="mono text-[12.5px]">{money(p.amount)}</span> },
                { header: 'Status', cell: (p) => <span className={badgeClass(p.status)}>{p.status}</span> },
                { header: 'Date', cell: (p) => <span className="mono text-[12.5px]">{shortDate(p.createdAt)}</span> },
              ]}
            />
          </Panel>
          <Panel title="Payment setup">
            <DataTable
              rows={clients}
              empty="No clients yet."
              columns={[
                { header: 'Client', cell: (c) => c.name, className: 'font-medium text-[#14141a]' },
                { header: 'Stage', cell: (c) => <span className={badgeClass(c.onboardingStage)}>{humanize(c.onboardingStage)}</span> },
                {
                  header: 'Stripe',
                  cell: (c) => (c.stripeCustomerId ? <span className="badge badge-green">linked</span> : <span className="badge badge-gray">not linked</span>),
                },
              ]}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
