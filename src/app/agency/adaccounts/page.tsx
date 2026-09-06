import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import StatGrid from '@/components/agency/StatGrid';
import Panel from '@/components/agency/Panel';
import DataTable from '@/components/agency/DataTable';
import { badgeClass, humanize, shortDate } from '@/lib/format';
import { Plug, CheckCircle2, AlertTriangle, Target } from 'lucide-react';

const AD_PROVIDERS = ['google_ads', 'meta', 'ctv', 'bing_ads', 'tiktok'];

export default async function AgencyAdAccountsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [connections, adsByOrg, clients] = await Promise.all([
    prisma.connection.findMany({
      where: { provider: { in: AD_PROVIDERS } },
      include: { org: true },
      orderBy: { provider: 'asc' },
    }),
    prisma.socialPost.groupBy({ by: ['orgId'], where: { kind: 'ad' }, _count: { _all: true } }),
    prisma.org.findMany({ where: { isAgency: false } }),
  ]);

  const adCount = (orgId: string) => adsByOrg.find((a) => a.orgId === orgId)?._count._all ?? 0;
  const connected = connections.filter((c) => c.status === 'connected').length;
  const errored = connections.filter((c) => c.status === 'error').length;
  const totalAds = adsByOrg.reduce((n, a) => n + a._count._all, 0);

  return (
    <>
      <PageHeader title="Ad accounts" desc="Linked ad platforms per client and what is running on them" pendingCount={errored} />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Linked Accounts', value: String(connections.length), icon: Plug },
            { label: 'Healthy', value: String(connected), icon: CheckCircle2 },
            { label: 'Needs Attention', value: String(errored), icon: AlertTriangle },
            { label: 'Live Ad Creatives', value: String(totalAds), icon: Target },
          ]}
        />
        <div className="px-[26px] pt-[18px] grid gap-4 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
          <Panel title="Platform connections">
            <DataTable
              rows={connections}
              empty="No ad platforms linked yet."
              columns={[
                { header: 'Platform', cell: (c) => humanize(c.provider), className: 'font-medium text-[#14141a]' },
                { header: 'Client', cell: (c) => c.org.name },
                { header: 'Status', cell: (c) => <span className={badgeClass(c.status)}>{humanize(c.status)}</span> },
                { header: 'Linked', cell: (c) => <span className="mono text-[12.5px]">{shortDate(c.createdAt)}</span> },
              ]}
            />
          </Panel>
          <Panel title="Ad creatives by client">
            <DataTable
              rows={clients}
              empty="No clients yet."
              columns={[
                { header: 'Client', cell: (c) => c.name, className: 'font-medium text-[#14141a]' },
                { header: 'Ad Creatives', cell: (c) => <span className="mono text-[12.5px]">{adCount(c.id)}</span> },
                {
                  header: 'Platforms',
                  cell: (c) => {
                    const own = connections.filter((x) => x.orgId === c.id);
                    return own.length === 0 ? <span className="text-[#918da0]">none linked</span> : (
                      <span className="flex flex-wrap gap-1.5">
                        {own.map((x) => <span key={x.id} className="badge badge-gray">{humanize(x.provider)}</span>)}
                      </span>
                    );
                  },
                },
              ]}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
