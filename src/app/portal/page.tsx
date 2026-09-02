import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import { TrendingUp, Users, DollarSign, Trophy, Clock, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function money(cents: number) {
  return '$' + Math.round(cents / 100).toLocaleString();
}

function DotMatrix({ pct }: { pct: number }) {
  const filled = Math.min(48, Math.round((pct / 100) * 48));
  return (
    <div className="grid grid-cols-16 gap-[3px]" style={{ gridTemplateColumns: 'repeat(16, 1fr)' }}>
      {Array.from({ length: 48 }).map((_, i) => (
        <span
          key={i}
          className="rounded-[2px]"
          style={{
            width: '100%',
            aspectRatio: '1',
            background: i < filled ? '#146c43' : '#efede7',
          }}
        />
      ))}
    </div>
  );
}

interface Metric {
  label: string;
  value: string;
  tail?: string;
  delta: string;
  note: string;
  route: string;
  barLabel: string;
  pct: number;
  chipBg: string;
  chipInk: string;
  icon: LucideIcon;
  pillBg: string;
  pillColor: string;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [leads, customers, deals, pendingApprovals] = await Promise.all([
    prisma.lead.findMany({ where: { orgId: session.orgId }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.customer.count({ where: { orgId: session.orgId } }),
    prisma.deal.findMany({ where: { orgId: session.orgId } }),
    prisma.approval.findMany({ where: { orgId: session.orgId, status: 'pending' }, take: 6 }),
  ]);

  const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
  const wonDeals = deals.filter(d => d.stage === 'won');
  const pipelineValue = activeDeals.reduce((s, d) => s + d.value, 0);
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0);
  const pendingCount = pendingApprovals.length;

  const metrics: Metric[] = [
    {
      label: 'Open pipeline',
      value: money(pipelineValue),
      delta: `+${activeDeals.length} deals`,
      note: `${activeDeals.length} deals · 4 stages`,
      route: '/portal/pipeline',
      barLabel: '$600k quarter target',
      pct: Math.min(100, Math.round((pipelineValue / 60000000) * 100)),
      chipBg: '#e8f3ec', chipInk: '#146c43', icon: TrendingUp,
      pillBg: '#e7f2ea', pillColor: '#1f6b18',
    },
    {
      label: 'Leads this month',
      value: String(leads.length),
      delta: `+${Math.max(0, leads.length - 5)}`,
      note: 'Local search and GBP',
      route: '/portal/tracking',
      barLabel: '60 lead target',
      pct: Math.min(100, Math.round((leads.length / 60) * 100)),
      chipBg: '#e7f2ea', chipInk: '#1f6b18', icon: Users,
      pillBg: '#e7f2ea', pillColor: '#1f6b18',
    },
    {
      label: 'Cost per qualified lead',
      value: '$214',
      delta: '−$38',
      note: 'Paid search and social',
      route: '/portal/tracking',
      barLabel: '$260 ceiling',
      pct: 82,
      chipBg: '#e8f3ec', chipInk: '#0f5132', icon: DollarSign,
      pillBg: '#e7f2ea', pillColor: '#1f6b18',
    },
    {
      label: 'Won this quarter',
      value: money(wonValue),
      delta: `${wonDeals.length} accounts`,
      note: 'Avg cycle 34 days',
      route: '/portal/customers',
      barLabel: '$400k quarter goal',
      pct: Math.min(100, Math.round((wonValue / 40000000) * 100)),
      chipBg: '#e7f2ea', chipInk: '#1f6b18', icon: Trophy,
      pillBg: 'transparent', pillColor: '#45454d',
    },
    {
      label: 'Waiting on you',
      value: String(pendingCount),
      delta: pendingCount > 0 ? 'oldest 3d' : 'all clear',
      note: 'Posts, ad copy, pricing',
      route: '/portal/approvals',
      barLabel: 'Cleared this week',
      pct: 64,
      chipBg: '#fff3d1', chipInk: '#8a5a00', icon: Clock,
      pillBg: 'transparent', pillColor: '#8a5a00',
    },
  ];

  // Pipeline stage summary
  const stages = [
    { id: 'lead', name: 'New', color: '#6b6b74' },
    { id: 'contacted', name: 'Qualified', color: '#146c43' },
    { id: 'qualified', name: 'Proposal', color: '#8a5a00' },
    { id: 'proposal', name: 'Negotiation', color: '#b02a12' },
    { id: 'won', name: 'Won', color: '#1f6b18' },
  ];
  const stageSummary = stages.map(st => {
    const sd = deals.filter(d => d.stage === st.id);
    const v = sd.reduce((s, d) => s + d.value, 0);
    return { ...st, count: sd.length, value: money(v), pct: sd.length > 0 ? Math.round((v / Math.max(...stages.map(s => deals.filter(d => d.stage === s.id).reduce((a, b) => a + b.value, 0) || 1)) * 100)) + '%' : '0%' };
  });

  return (
    <>
      <PageHeader title="Dashboard" desc="Demand, pipeline, and what needs your decision today" pendingCount={pendingCount} />

      <div className="flex-1 min-w-0">
        {/* Metric cards */}
        <div className="px-[26px] grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))' }}>
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-white border border-[#eeece6] rounded-[13px] p-5">
                <div className="flex items-start gap-[11px]">
                  <span
                    className="w-[38px] h-[38px] rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: m.chipBg }}
                  >
                    <Icon size={19} strokeWidth={1.8} style={{ color: m.chipInk }} />
                  </span>
                  <span className="min-w-0 flex flex-col gap-[5px] pt-0.5">
                    <span className="mono text-[11px] font-medium tracking-[0.13em] uppercase leading-[1.3] text-[#5c5a52]">{m.label}</span>
                    <span className="text-[12.5px] leading-[1.35] text-[#6b6b74]">{m.note}</span>
                  </span>
                  <a
                    href={m.route}
                    aria-label="Open"
                    className="ml-auto w-8 h-8 flex-shrink-0 rounded-full border border-[#e9e6de] bg-white flex items-center justify-center hover:border-[#146c43] hover:bg-[#f1f8f3] transition-colors"
                  >
                    <ArrowUpRight size={13} strokeWidth={1.9} className="text-[#14141a]" />
                  </a>
                </div>
                <div className="mt-[18px] flex items-baseline gap-[11px] flex-wrap">
                  <span className="text-[38px] font-semibold tracking-[-0.045em] leading-1 text-[#14141a]">
                    {m.value}<span className="text-[#918da0]">{m.tail}</span>
                  </span>
                  <span
                    className="text-[13px] font-semibold rounded-full px-2.5 py-[3px]"
                    style={{ background: m.pillBg, color: m.pillColor }}
                  >
                    {m.delta}
                  </span>
                </div>
                <div className="mt-4">
                  <DotMatrix pct={m.pct} />
                  <div className="mt-2.5 flex items-baseline gap-2.5 text-[12px] leading-[1.4] text-[#6b6b74]">
                    <span className="min-w-0">{m.barLabel}</span>
                    <span className="ml-auto flex-shrink-0 mono font-semibold text-[#0f5132]">{m.pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two-column: Decisions + Pipeline */}
        <div className="px-[26px] pt-[18px] grid gap-4 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
          {/* Needs your decision */}
          <section className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
            <div className="h-[52px] flex items-center gap-2.5 px-5">
              <span className="text-[17px] font-semibold tracking-[-0.015em]">Needs your decision</span>
              {pendingCount > 0 && (
                <span className="mono text-[12px] font-semibold bg-[#fff3d1] text-[#8a5a00] rounded-full px-2 py-[2px]">{pendingCount}</span>
              )}
              <a href="/portal/approvals" className="ml-auto text-[12.5px] font-medium text-[#146c43] hover:text-[#0f5132]">Open</a>
            </div>
            {pendingApprovals.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-[#6b6b74]">Nothing waiting on you.</div>
            ) : (
              pendingApprovals.map((a) => (
                <a
                  key={a.id}
                  href="/portal/approvals"
                  className="flex items-center gap-3 px-5 py-[11px] border-t border-[#efede7] hover:bg-[#f7f6f2] transition-colors"
                >
                  <span className="w-[5px] h-[5px] rounded-full bg-[#ffc400] flex-shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold truncate">{a.title}</span>
                    <span className="block mt-0.5 text-[12.5px] text-[#5f5f66] truncate">{a.meta || a.kind}</span>
                  </span>
                  <span className="ml-auto mono text-[12.5px] text-[#5f5f66] whitespace-nowrap flex-shrink-0">{a.kind}</span>
                </a>
              ))
            )}
          </section>

          {/* Pipeline by stage */}
          <section className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
            <div className="h-[52px] flex items-center gap-2.5 px-5">
              <span className="text-[17px] font-semibold tracking-[-0.015em]">Pipeline by stage</span>
              <a href="/portal/pipeline" className="ml-auto text-[12.5px] font-medium text-[#146c43] hover:text-[#0f5132]">Open</a>
            </div>
            {stageSummary.map((row) => (
              <div key={row.id} className="flex items-center gap-3 px-5 py-3 border-t border-[#efede7]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                <span className="text-[13.5px] font-medium w-24">{row.name}</span>
                <div className="flex-1 h-1.5 bg-[#f7f6f2] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(2, parseInt(row.pct))}%`, background: row.color }} />
                </div>
                <span className="mono text-[12px] text-[#5f5f66] flex-shrink-0">{row.count}</span>
                <span className="mono text-[12.5px] font-semibold text-[#14141a] flex-shrink-0 w-16 text-right">{row.value}</span>
              </div>
            ))}
          </section>
        </div>

        {/* Recent activity */}
        <div className="px-[26px] pt-[18px] pb-[26px]">
          <section className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
            <div className="h-[52px] flex items-center gap-2.5 px-5">
              <span className="text-[17px] font-semibold tracking-[-0.015em]">Recent activity</span>
            </div>
            {leads.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-[#6b6b74]">No activity yet.</div>
            ) : (
              leads.slice(0, 6).map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-[11px] border-t border-[#efede7]">
                  <span className="w-2 h-2 rounded-full bg-[#146c43] flex-shrink-0" />
                  <span className="min-w-0 flex-1 text-[13.5px] font-medium truncate">
                    New lead — {lead.name}
                    {lead.company && <span className="text-[#5f5f66] font-normal"> · {lead.company}</span>}
                  </span>
                  <span className="mono text-[12px] text-[#5f5f66] flex-shrink-0">{lead.source || 'organic'}</span>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </>
  );
}
