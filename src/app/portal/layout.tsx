import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Sidebar from '@/components/portal/Sidebar';

const ONBOARDING_ORDER = [
  'proposal_sent', 'proposal_approved', 'payment_complete', 'account_created',
  'brand_uploaded', 'connections_linked', 'reviews_approved', 'active',
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/api/auth/login');

  const org = session.orgId ? await prisma.org.findUnique({ where: { id: session.orgId } }) : null;
  const isActive = org?.onboardingStage === 'active';
  const stageIndex = org ? ONBOARDING_ORDER.indexOf(org.onboardingStage) : 0;
  const userName = session.name || session.email.split('@')[0];

  const [pendingCount, liveCount] = await Promise.all([
    prisma.approval.count({ where: { orgId: session.orgId, status: 'pending' } }),
    prisma.lead.count({ where: { orgId: session.orgId, status: 'new' } }),
  ]);
  const setupProgress = Math.max(0, ONBOARDING_ORDER.indexOf(org?.onboardingStage || 'proposal_sent'));
  const wikiPct = Math.min(100, Math.round((setupProgress / (ONBOARDING_ORDER.length - 1)) * 100));
  const wikiNote = wikiPct >= 100
    ? 'Your knowledge base is complete. The agent cites it on every draft.'
    : 'Upload your brand kit, photos, and pricing to give the agent what it needs.';

  return (
    <div style={{ minHeight: '100vh', background: '#e6e3dc', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 'calc(100vh - 28px)', background: '#f6f5f1', borderRadius: 13, overflow: 'hidden', border: '1px solid #dcd8cf' }}>
        <Sidebar
          brandName={org?.name || 'Legacy Forward'}
          userName={userName}
          pendingCount={pendingCount}
          liveCount={liveCount}
          wikiPct={wikiPct}
          wikiNote={wikiNote}
        />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {!isActive && org && (
            <div style={{ borderBottom: '1px solid #e9e6de', background: 'rgba(255,243,209,0.4)', padding: '10px 28px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 500, color: '#14141a' }}>Onboarding in progress</span>
              <span style={{ color: '#5f5f66' }}>— Step {stageIndex + 1} of {ONBOARDING_ORDER.length}: {org.onboardingStage.replace(/_/g, ' ')}</span>
              <a href="/portal/onboarding" style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 600, color: '#146c43' }}>Continue setup →</a>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
