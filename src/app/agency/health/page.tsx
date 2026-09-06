import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/agency/Panel';
import DataTable from '@/components/agency/DataTable';
import { humanize, initials } from '@/lib/format';
import { HeartPulse, AlertTriangle, CheckCircle2, Plug } from 'lucide-react';
import StatGrid from '@/components/agency/StatGrid';

export default async function AgencyHealthPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const clients = await prisma.org.findMany({
    where: { isAgency: false },
    include: {
      connections: true,
      _count: {
        select: {
          approvals: true,
          leads: true,
          websitePages: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const [pendingByOrg, brokenPagesByOrg] = await Promise.all([
    prisma.approval.groupBy({ by: ['orgId'], where: { status: 'pending' }, _count: { _all: true } }),
    prisma.websitePage.groupBy({ by: ['orgId'], where: { status: 'needs_work' }, _count: { _all: true } }),
  ]);

  const rows = clients.map((c) => {
    const brokenConnections = c.connections.filter((x) => x.status === 'error').length;
    const stalePending = pendingByOrg.find((p) => p.orgId === c.id)?._count._all ?? 0;
    const brokenPages = brokenPagesByOrg.find((p) => p.orgId === c.id)?._count._all ?? 0;
    const issues = brokenConnections + brokenPages + (stalePending > 3 ? 1 : 0);
    return {
      id: c.id,
      name: c.name,
      stage: c.onboardingStage,
      connections: c.connections.length,
      brokenConnections,
      stalePending,
      brokenPages,
      leads: c._count.leads,
      score: Math.max(0, 100 - issues * 15 - (c.onboardingStage === 'active' ? 0 : 10)),
      issues,
    };
  });

  const atRisk = rows.filter((r) => r.issues > 0);
  const avgScore = rows.length ? Math.round(rows.reduce((n, r) => n + r.score, 0) / rows.length) : 0;

  return (
    <>
      <PageHeader title="Account health" desc="Which accounts are solid and which ones are quietly breaking" pendingCount={atRisk.length} />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Average Score', value: `${avgScore}`, icon: HeartPulse },
            { label: 'Healthy', value: String(rows.length - atRisk.length), icon: CheckCircle2 },
            { label: 'At Risk', value: String(atRisk.length), icon: AlertTriangle },
            { label: 'Integrations', value: String(rows.reduce((n, r) => n + r.connections, 0)), icon: Plug },
          ]}
        />
        <div className="px-[26px] pt-[18px]">
          <Panel title="Health by client">
            <DataTable
              rows={rows}
              empty="No clients to monitor yet."
              columns={[
                {
                  header: 'Client',
                  className: 'font-medium text-[#14141a]',
                  cell: (r) => (
                    <span className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-[#f7f6f2] flex items-center justify-center text-[11px] font-bold text-[#5c5a52]">
                        {initials(r.name)}
                      </span>
                      <span>{r.name}</span>
                    </span>
                  ),
                },
                {
                  header: 'Score',
                  cell: (r) => (
                    <span className="flex items-center gap-2">
                      <span className="w-[74px] h-[6px] rounded-full bg-[#efede7] overflow-hidden">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${r.score}%`, background: r.score >= 85 ? '#146c43' : r.score >= 60 ? '#b8860b' : '#cf1c0c' }}
                        />
                      </span>
                      <span className="mono text-[12px] font-semibold text-[#14141a]">{r.score}</span>
                    </span>
                  ),
                },
                { header: 'Stage', cell: (r) => humanize(r.stage) },
                { header: 'Broken Links', cell: (r) => (r.brokenConnections ? <span className="badge badge-red">{r.brokenConnections}</span> : '—') },
                { header: 'Pages To Fix', cell: (r) => (r.brokenPages ? <span className="badge badge-yellow">{r.brokenPages}</span> : '—') },
                { header: 'Open Approvals', cell: (r) => <span className="mono text-[12.5px]">{r.stalePending}</span> },
                { header: 'Leads', cell: (r) => <span className="mono text-[12.5px]">{r.leads}</span> },
              ]}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
