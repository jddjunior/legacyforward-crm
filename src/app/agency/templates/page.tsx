import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import StatGrid from '@/components/agency/StatGrid';
import Panel, { EmptyState } from '@/components/agency/Panel';
import { money } from '@/lib/format';
import { LayoutTemplate, Repeat, CircleDollarSign, Percent } from 'lucide-react';

export default async function AgencyTemplatesPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const services = await prisma.service.findMany({
    include: { org: true },
    orderBy: { name: 'asc' },
  });

  // Services sold to more than one client are the agency's reusable offer templates.
  const grouped = new Map<string, typeof services>();
  for (const s of services) {
    grouped.set(s.name, [...(grouped.get(s.name) ?? []), s]);
  }

  const templates = [...grouped.entries()]
    .map(([name, uses]) => {
      const avgPrice = Math.round(uses.reduce((n, u) => n + u.price, 0) / uses.length);
      const withCost = uses.filter((u) => u.cost != null);
      const avgCost = withCost.length ? Math.round(withCost.reduce((n, u) => n + (u.cost ?? 0), 0) / withCost.length) : null;
      return {
        id: name,
        name,
        uses,
        description: uses.find((u) => u.description)?.description ?? null,
        avgPrice,
        avgCost,
        margin: avgCost != null && avgPrice > 0 ? Math.round(((avgPrice - avgCost) / avgPrice) * 100) : null,
      };
    })
    .sort((a, b) => b.uses.length - a.uses.length);

  const reused = templates.filter((t) => t.uses.length > 1).length;
  const avgMargins = templates.filter((t) => t.margin != null);

  return (
    <>
      <PageHeader title="Templates" desc="Reusable service offers and how they price out across clients" />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Offer Templates', value: String(templates.length), icon: LayoutTemplate },
            { label: 'Reused Offers', value: String(reused), icon: Repeat },
            { label: 'Deployments', value: String(services.length), icon: CircleDollarSign },
            {
              label: 'Avg Margin',
              value: avgMargins.length ? `${Math.round(avgMargins.reduce((n, t) => n + (t.margin ?? 0), 0) / avgMargins.length)}%` : '—',
              icon: Percent,
            },
          ]}
        />
        <div className="px-[26px] pt-[18px]">
          <Panel title="Service catalog">
            {templates.length === 0 ? (
              <EmptyState>No services defined yet. Add services on a client to build your catalog.</EmptyState>
            ) : (
              <div className="grid gap-3.5 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {templates.map((t) => (
                  <article key={t.id} className="rounded-[11px] border border-[#eeece6] bg-[#faf9f6] p-4">
                    <div className="flex items-start gap-2">
                      <h3 className="text-[14.5px] font-semibold tracking-[-0.012em] text-[#14141a]">{t.name}</h3>
                      <span className="badge badge-gray ml-auto flex-shrink-0">{t.uses.length} client{t.uses.length === 1 ? '' : 's'}</span>
                    </div>
                    {t.description && <p className="text-[12.5px] text-[#5f5f66] mt-1.5 line-clamp-2">{t.description}</p>}
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-[22px] font-semibold tracking-[-0.03em] text-[#14141a]">{money(t.avgPrice)}</span>
                      {t.margin != null && <span className="mono text-[11.5px] text-[#146c43]">{t.margin}% margin</span>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#eeece6] flex flex-wrap gap-1.5">
                      {t.uses.map((u) => (
                        <span key={u.id} className={`badge ${u.active ? 'badge-green' : 'badge-gray'}`}>{u.org.name}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
