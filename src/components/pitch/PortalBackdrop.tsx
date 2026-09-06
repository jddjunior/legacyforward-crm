import { prisma } from '@/lib/db';
import Sidebar from '@/components/portal/Sidebar';
import DashboardContent from '@/components/portal/DashboardContent';
import { ONBOARDING_ORDER } from '@/lib/onboarding';

// The CRM portal rendered behind the pitch gateway, blurred and inert —
// the gated portalWrap from the design: it unlocks after payment and
// onboarding.
export default async function PortalBackdrop({ orgId }: { orgId: string }) {
  const org = await prisma.org.findUnique({ where: { id: orgId } });
  if (!org) return null;

  const [pendingCount, liveCount] = await Promise.all([
    prisma.approval.count({ where: { orgId, status: 'pending' } }),
    prisma.lead.count({ where: { orgId, status: 'new' } }),
  ]);

  const setupProgress = Math.max(0, ONBOARDING_ORDER.indexOf(org.onboardingStage));
  const wikiPct = Math.min(100, Math.round((setupProgress / (ONBOARDING_ORDER.length - 1)) * 100));
  const wikiNote = wikiPct >= 100
    ? 'Your knowledge base is complete. The agent cites it on every draft.'
    : 'Upload your brand kit, photos, and pricing to give the agent what it needs.';

  return (
    <div
      aria-hidden="true"
      style={{
        filter: 'blur(1.2px) saturate(0.85)',
        opacity: 0.72,
        pointerEvents: 'none',
        userSelect: 'none',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div style={{ minHeight: '100vh', background: '#e6e3dc', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 'calc(100vh - 28px)', background: '#f6f5f1', borderRadius: 13, overflow: 'hidden', border: '1px solid #dcd8cf' }}>
          <Sidebar
            brandName={org.name}
            userName={org.name}
            pendingCount={pendingCount}
            liveCount={liveCount}
            wikiPct={wikiPct}
            wikiNote={wikiNote}
          />
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <DashboardContent orgId={orgId} />
          </main>
        </div>
      </div>
    </div>
  );
}
