import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import LeadsView from '@/components/portal/LeadsView';

export default async function LeadsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [dbLeads, dbDeals] = await Promise.all([
    prisma.lead.findMany({ where: { orgId: session.orgId }, orderBy: { createdAt: 'desc' } }),
    prisma.deal.findMany({ where: { orgId: session.orgId, stage: { not: 'won' } } }),
  ]);

  const leadRows = dbLeads.map(l => {
    const ageDays = Math.max(0, Math.round((Date.now() - l.createdAt.getTime()) / 86400000));
    const score = l.status === 'qualified' ? 78 : l.status === 'contacted' ? 61 : 44;
    return {
      name: l.name,
      company: l.email || l.phone || '—',
      stage: l.status === 'qualified' ? 'Qualified' : l.status === 'contacted' ? 'Contacted' : l.status === 'lost' ? 'Lost' : 'New',
      color: l.status === 'qualified' ? '#1f6b18' : l.status === 'contacted' ? '#2a49b8' : l.status === 'lost' ? '#b02a12' : '#5f5f66',
      source: (l.source || '—'),
      score,
      scoreColor: score > 60 ? '#146c43' : '#8a5a00',
      value: '—',
      touch: `${ageDays}d ago`,
    };
  });

  const leadValue = '$' + dbDeals.reduce((a, b) => a + b.value, 0).toLocaleString('en-US');

  return (
    <>
      <Header title="Leads" desc="Source, fit, and value on every inbound" pendingCount={0} />
      <RouteShell>
        <LeadsView leadRows={leadRows} leadValue={leadValue} />
      </RouteShell>
    </>
  );
}
