import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import StatGrid from '@/components/agency/StatGrid';
import Panel from '@/components/agency/Panel';
import DataTable from '@/components/agency/DataTable';
import { money } from '@/lib/format';
import { Users, TrendingUp, Megaphone, Star } from 'lucide-react';

export default async function AgencyReportsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [clients, wonDeals, leadsByOrg, postsByOrg, reviewsByOrg] = await Promise.all([
    prisma.org.findMany({ where: { isAgency: false }, orderBy: { name: 'asc' } }),
    prisma.deal.groupBy({ by: ['orgId'], where: { stage: 'won' }, _sum: { value: true }, _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['orgId'], _count: { _all: true } }),
    prisma.socialPost.groupBy({ by: ['orgId'], where: { status: 'published' }, _count: { _all: true } }),
    prisma.review.groupBy({ by: ['orgId'], where: { status: 'published' }, _count: { _all: true } }),
  ]);

  const lookup = <T extends { orgId: string }>(rows: T[], orgId: string) => rows.find((r) => r.orgId === orgId);

  const rows = clients.map((c) => {
    const won = lookup(wonDeals, c.id);
    return {
      id: c.id,
      name: c.name,
      leads: lookup(leadsByOrg, c.id)?._count._all ?? 0,
      wonCount: won?._count._all ?? 0,
      revenue: won?._sum.value ?? 0,
      posts: lookup(postsByOrg, c.id)?._count._all ?? 0,
      reviews: lookup(reviewsByOrg, c.id)?._count._all ?? 0,
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      leads: acc.leads + r.leads,
      revenue: acc.revenue + r.revenue,
      posts: acc.posts + r.posts,
      reviews: acc.reviews + r.reviews,
    }),
    { leads: 0, revenue: 0, posts: 0, reviews: 0 },
  );

  return (
    <>
      <PageHeader title="Reports" desc="Month-to-date performance and what each client is getting" />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Leads Delivered', value: String(totals.leads), icon: Users },
            { label: 'Revenue Won', value: money(totals.revenue), icon: TrendingUp },
            { label: 'Posts Published', value: String(totals.posts), icon: Megaphone },
            { label: 'Reviews Live', value: String(totals.reviews), icon: Star },
          ]}
        />
        <div className="px-[26px] pt-[18px]">
          <Panel title="Per-client breakdown">
            <DataTable
              rows={rows}
              empty="No clients to report on yet."
              columns={[
                { header: 'Client', cell: (r) => r.name, className: 'font-medium text-[#14141a]' },
                { header: 'Leads', cell: (r) => r.leads },
                { header: 'Deals Won', cell: (r) => r.wonCount },
                { header: 'Revenue', cell: (r) => <span className="mono text-[12.5px]">{money(r.revenue)}</span> },
                { header: 'Posts', cell: (r) => r.posts },
                { header: 'Reviews', cell: (r) => r.reviews },
              ]}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
