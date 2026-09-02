import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import PipelineView from '@/components/portal/PipelineView';
import { money } from '@/lib/design/data';

export default async function PipelinePage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const dbDeals = await prisma.deal.findMany({ where: { orgId: session.orgId }, orderBy: { createdAt: 'desc' } });

  const deals = dbDeals.map(d => ({
    id: d.id, name: d.title, company: d.title, value: d.value,
    source: '—',
    stage: d.stage,
    age: Math.max(0, Math.round((Date.now() - d.createdAt.getTime()) / 86400000)),
  }));

  return (
    <>
      <Header title="Pipeline" desc="Drag to change stage" pendingCount={0} />
      <RouteShell>
        <PipelineView deals={deals} boardValue={money(deals.reduce((a, b) => a + b.value, 0))} />
      </RouteShell>
    </>
  );
}
