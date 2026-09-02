import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import { STAGES, money, dotMatrix } from '@/lib/design/data';

const METRIC_ICONS = {
  pipeline: 'M12 3v18M15.5 7.5c0-1.4-1.6-2.5-3.5-2.5S8.5 6.1 8.5 7.5 10.1 10 12 10s3.5 1.1 3.5 2.5S13.9 15 12 15s-3.5-1.1-3.5-2.5',
  leads: 'M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4.5 20.5a7.5 7.5 0 0 1 15 0',
  cost: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  won: 'M8 4.5h8v5a4 4 0 0 1-8 0zM8 6H5.5v1.5A2.5 2.5 0 0 0 8 10M16 6h2.5v1.5A2.5 2.5 0 0 1 16 10M12 13.5v3M9 19.5h6',
  waiting: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3.5 2',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [dbDeals, pendingApprovals, recentLeads, dbReviews] = await Promise.all([
    prisma.deal.findMany({ where: { orgId: session.orgId } }),
    prisma.approval.findMany({ where: { orgId: session.orgId, status: 'pending' }, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.lead.findMany({ where: { orgId: session.orgId }, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.review.findMany({ where: { orgId: session.orgId } }),
  ]);

  const sum = (arr: { value: number }[]) => arr.reduce((a, b) => a + b.value, 0);
  const byStage = (id: string) => dbDeals.filter(d => d.stage === id);
  const boardTotal = sum(dbDeals);
  const wonValue = sum(byStage('won'));
  const openValue = boardTotal - wonValue;
  const openCount = dbDeals.filter(d => d.stage !== 'won').length;
  const pendingCount = pendingApprovals.length;
  const leadCount = recentLeads.length;

  const wonAvg = byStage('won').length ? Math.round(wonValue / byStage('won').length) : 0;

  const metrics = [
    {
      label: 'Open pipeline', value: money(openValue), delta: `${openCount} deals`, note: `${STAGES.length - 1} active stages`,
      route: '/portal/pipeline', barLabel: 'Quarter target',
      pct: Math.min(100, Math.round((openValue / 600000) * 100)),
      chipBg: '#e8f3ec', chipInk: '#146c43', d: METRIC_ICONS.pipeline,
      pillStyle: { fontSize: 13, fontWeight: 500, color: '#45454d', padding: 0 } as React.CSSProperties,
    },
    {
      label: 'Leads this month', value: String(leadCount), delta: 'all sources', note: 'Calls, forms, referrals',
      route: '/portal/leads', barLabel: 'Monthly target',
      pct: Math.min(100, Math.round((leadCount / 60) * 100)),
      chipBg: '#e7f2ea', chipInk: '#1f6b18', d: METRIC_ICONS.leads,
      pillStyle: { fontSize: 13, fontWeight: 500, color: '#45454d', padding: 0 } as React.CSSProperties,
    },
    {
      label: 'Reviews pulled', value: String(dbReviews.length), delta: 'aggregators', note: 'You choose what publishes',
      route: '/portal/reviews', barLabel: 'Collection goal',
      pct: Math.min(100, Math.round((dbReviews.length / 312) * 100)),
      chipBg: '#e7f2ea', chipInk: '#1f6b18', d: METRIC_ICONS.cost,
      pillStyle: { fontSize: 13, fontWeight: 500, color: '#45454d', padding: 0 } as React.CSSProperties,
    },
    {
      label: 'Won this quarter', value: money(wonValue), delta: `${byStage('won').length} accounts`, note: `Avg deal ${money(wonAvg)}`,
      route: '/portal/customers', barLabel: 'Quarter goal',
      pct: Math.min(100, Math.round((wonValue / 400000) * 100)),
      chipBg: '#e7f2ea', chipInk: '#1f6b18', d: METRIC_ICONS.won,
      pillStyle: { fontSize: 13, fontWeight: 500, color: '#45454d', padding: 0 } as React.CSSProperties,
    },
    {
      label: 'Waiting on you', value: String(pendingCount), delta: pendingCount > 0 ? 'needs review' : 'all clear', note: 'Posts, ad copy, pricing',
      route: '/portal/approvals', barLabel: 'Cleared this week',
      pct: pendingCount > 0 ? Math.min(100, 36 * pendingCount) : 100,
      chipBg: '#fff3d1', chipInk: '#8a5a00', d: METRIC_ICONS.waiting,
      pillStyle: { fontSize: 13, fontWeight: 600, color: '#8a5a00', padding: 0 } as React.CSSProperties,
    },
  ];

  const maxStage = Math.max(0, ...STAGES.map(st => sum(byStage(st.id))));
  const stageSummary = STAGES.map(st => {
    const v = sum(byStage(st.id));
    return { name: st.name, count: byStage(st.id).length, value: money(v), pct: (maxStage ? Math.round((v / maxStage) * 100) : 0) + '%', color: st.color };
  });

  return (
    <>
      <Header title="Dashboard" desc="Demand, pipeline, and what needs your decision today" pendingCount={pendingCount} />
      <RouteShell bare>
        <div>
          <div style={{ padding: '0 26px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(215px,1fr))', gap: 16 }}>
            {metrics.map(m => (
              <div key={m.label} style={{ background: '#ffffff', border: '1px solid #eeece6', borderRadius: 13, padding: '20px 22px 22px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 999, flex: '0 0 38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.chipBg }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={m.chipInk} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }} aria-hidden="true"><path d={m.d} /></svg>
                  </span>
                  <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 2 }}>
                    <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, fontWeight: 500, letterSpacing: '0.13em', textTransform: 'uppercase', lineHeight: 1.3, color: '#5c5a52' }}>{m.label}</span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.35, color: '#6b6b74' }}>{m.note}</span>
                  </span>
                  <Link href={m.route} aria-label="Open" style={{ marginLeft: 'auto', width: 32, height: 32, flex: '0 0 32px', borderRadius: 999, border: '1px solid #e9e6de', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#14141a" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }} aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
                  </Link>
                </div>
                <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 11, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1, color: '#14141a' }}>{m.value}</span>
                  <span style={m.pillStyle}>{m.delta}</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16,1fr)', gap: 3 }}>
                    {dotMatrix(m.pct).map((dot, i) => <span key={i} style={dot.style} />)}
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 12, lineHeight: 1.4, color: '#6b6b74' }}>
                    <span style={{ minWidth: 0 }}>{m.barLabel}</span>
                    <span style={{ marginLeft: 'auto', flex: '0 0 auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0f5132' }}>{m.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '18px 26px 0 26px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(360px,1fr))', gap: 16, alignItems: 'start' }}>
            <section style={{ background: '#ffffff', border: '1px solid #e9e6de', borderRadius: 13, overflow: 'hidden' }}>
              <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px' }}>
                <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}>Needs your decision</span>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 600, background: '#fff3d1', color: '#8a5a00', borderRadius: 999, padding: '2px 8px' }}>{pendingCount}</span>
                <Link href="/portal/approvals" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#146c43', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Open</Link>
              </div>
              {pendingApprovals.map(a => (
                <Link key={a.id} href="/portal/approvals" style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: '1px solid #efede7', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: '#ffc400', flex: '0 0 5px' }} aria-hidden="true" />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{a.title}</span>
                    <span style={{ display: 'block', marginTop: 2, fontSize: 12.5, color: '#5f5f66' }}>{a.type}</span>
                  </span>
                  <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66', whiteSpace: 'nowrap' }}>{a.type}</span>
                </Link>
              ))}
              {pendingApprovals.length === 0 && (
                <div style={{ padding: '24px 20px', fontSize: 13, color: '#5f5f66' }}>Nothing waiting on you.</div>
              )}
            </section>

            <section style={{ background: '#ffffff', border: '1px solid #e9e6de', borderRadius: 13, overflow: 'hidden' }}>
              <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px' }}>
                <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}>Pipeline</span>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66' }}>{money(boardTotal)}</span>
                <Link href="/portal/pipeline" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#146c43', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Board</Link>
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stageSummary.map(row => (
                  <div key={row.name}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, fontSize: 12.5 }}>
                      <span style={{ fontWeight: 500 }}>{row.name}</span>
                      <span style={{ color: '#5f5f66' }}>{row.count}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', color: '#45454d' }}>{row.value}</span>
                    </div>
                    <div style={{ marginTop: 7, height: 6, borderRadius: 999, background: '#e4e4ea', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 999, width: row.pct, background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section style={{ margin: '18px 26px 26px 26px', background: '#ffffff', border: '1px solid #e9e6de', borderRadius: 13, overflow: 'hidden' }}>
            <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
              <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}>Recent activity</span>
            </div>
            {recentLeads.map((l, i) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #efede7' }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: '#146c43', flex: '0 0 5px' }} aria-hidden="true" />
                <span style={{ fontSize: 12.5 }}>New lead — {l.name}{l.email ? ' · ' + l.email : l.phone ? ' · ' + l.phone : ''}</span>
                <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66' }}>{l.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <div style={{ padding: '24px 20px', fontSize: 13, color: '#5f5f66' }}>No activity yet — created leads and approvals will appear here.</div>
            )}
          </section>
        </div>
      </RouteShell>
    </>
  );
}
