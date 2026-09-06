import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import { requestPageChange } from '@/app/actions/website';

const STATUS_COLOR: Record<string, string> = {
  live: '#146c43',
  in_review: '#2a49b8',
  building: '#8a5a00',
  needs_work: '#b02a12',
};

export default async function WebsitePage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [pages, openChanges] = await Promise.all([
    prisma.websitePage.findMany({ where: { orgId: session.orgId }, orderBy: { createdAt: 'asc' } }),
    prisma.changeRequest.count({ where: { proposal: { orgId: session.orgId }, status: 'pending' } }),
  ]);

  const kpis = [
    { label: 'Pages live', value: String(pages.filter(p => p.status === 'live').length), note: 'serving traffic', color: '#146c43' },
    { label: 'Building', value: String(pages.filter(p => p.status === 'building').length), note: 'agent drafting now', color: '#8a5a00' },
    { label: 'In review', value: String(pages.filter(p => p.status === 'in_review').length), note: 'with the agency', color: '#2a49b8' },
    { label: 'Open change requests', value: String(openChanges), note: 'on the agency queue', color: openChanges > 0 ? '#b02a12' : '#146c43' },
  ];

  return (
    <>
      <Header title="Website" desc="Build status and change requests" pendingCount={0} />
      <RouteShell>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', borderBottom: '1px solid #e9e6de' }}>
            {kpis.map(k => (
              <div key={k.label} style={{ padding: '16px 20px', borderRight: '1px solid #efede7' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#5f5f66' }}>{k.label}</div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 400, letterSpacing: '-0.02em' }}>{k.value}</div>
                <div style={{ marginTop: 5, fontSize: 12.5, color: k.color }}>{k.note}</div>
              </div>
            ))}
          </div>

          {pages.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', borderBottom: '1px solid #efede7', flexWrap: 'wrap' }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: STATUS_COLOR[p.status] || '#5f5f66', flex: '0 0 5px' }} aria-hidden="true" />
              <span style={{ fontSize: 13.5, fontWeight: 600, minWidth: 150 }}>{p.title}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66', minWidth: 190 }}>{p.path}</span>
              <span style={{ fontSize: 12, color: STATUS_COLOR[p.status] || '#5f5f66' }}>{p.status.replace('_', ' ')}</span>
              <span style={{ fontSize: 12.5, color: '#5f5f66' }}>{p.note}</span>
              <form action={requestPageChange} style={{ marginLeft: 'auto' }}>
                <input type="hidden" name="pageId" value={p.id} />
                <button type="submit" style={{ height: 30, padding: '0 12px', borderRadius: 11, border: '1px solid #c6c6ce', background: '#ffffff', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>Request change</button>
              </form>
            </div>
          ))}
          {pages.length === 0 && (
            <div style={{ padding: '26px 20px', fontSize: 13, color: '#5f5f66' }}>No pages tracked yet — the build lands here as each page ships.</div>
          )}
        </div>
      </RouteShell>
    </>
  );
}
