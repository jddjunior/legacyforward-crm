import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';

export default async function SeoPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const keywords = await prisma.seoKeyword.findMany({
    where: { orgId: session.orgId },
    orderBy: { position: 'asc' },
  });

  const top3 = keywords.filter(k => k.position <= 3).length;
  const improving = keywords.filter(k => k.change > 0).length;
  const avgPos = keywords.length ? (keywords.reduce((a, b) => a + b.position, 0) / keywords.length).toFixed(1) : '—';
  const volume = keywords.reduce((a, b) => a + b.volume, 0);

  const kpis = [
    { label: 'Keywords tracked', value: String(keywords.length), delta: `${improving} improving`, color: improving > 0 ? '#1f6b18' : '#5f5f66' },
    { label: 'In top 3', value: String(top3), delta: keywords.length ? Math.round((top3 / keywords.length) * 100) + '% of set' : '—', color: '#1f6b18' },
    { label: 'Avg position', value: avgPos === '—' ? '—' : String(avgPos), delta: 'across the set', color: '#5f5f66' },
    { label: 'Volume/mo', value: volume.toLocaleString('en-US'), delta: 'searches', color: '#5f5f66' },
  ];

  const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#5f5f66', borderBottom: '1px solid #e9e6de' };
  const thRight: React.CSSProperties = { ...th, textAlign: 'right' };
  const td: React.CSSProperties = { padding: '12px 10px', fontSize: 13, borderBottom: '1px solid #efede7' };
  const tdMono: React.CSSProperties = { ...td, fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66' };
  const tdRight: React.CSSProperties = { ...tdMono, textAlign: 'right' };

  return (
    <>
      <Header title="SEO" desc="Visibility and the pages earning it" pendingCount={0} />
      <RouteShell>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', borderBottom: '1px solid #e9e6de' }}>
            {kpis.map(k => (
              <div key={k.label} style={{ padding: '16px 20px', borderRight: '1px solid #efede7' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#5f5f66' }}>{k.label}</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 9 }}>
                  <span style={{ fontSize: 20, fontWeight: 400, letterSpacing: '-0.02em' }}>{k.value}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: k.color }}>{k.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, padding: '8px 20px' }}>Keyword</th>
                <th style={th}>Landing page</th>
                <th style={thRight}>Position</th>
                <th style={thRight}>Change</th>
                <th style={{ ...thRight, padding: '8px 20px' }}>Volume</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map(k => {
                const chgColor = k.change > 0 ? '#1f6b18' : k.change < 0 ? '#b02a12' : '#5f5f66';
                const chg = k.change > 0 ? `+${k.change}` : String(k.change);
                return (
                  <tr key={k.id}>
                    <td style={{ ...td, padding: '12px 20px' }}>{k.term}</td>
                    <td style={tdMono}>{k.landingPage}</td>
                    <td style={tdRight}>{k.position}</td>
                    <td style={{ ...tdRight, color: chgColor }}>{chg}</td>
                    <td style={{ ...tdRight, padding: '12px 20px' }}>{k.volume.toLocaleString('en-US')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {keywords.length === 0 && (
            <div style={{ padding: '26px 20px', fontSize: 13, color: '#5f5f66' }}>No rank data pulled yet — the weekly sweep lands here.</div>
          )}
        </div>
      </RouteShell>
    </>
  );
}
