import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

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

  return (
    <div className="flex min-h-screen bg-ink-surface">
      <Sidebar userName={userName} orgName={org?.name || 'Loading…'} badge={null} />
      <main className="flex-1 min-w-0">
        {!isActive && org && (
          <div className="bg-accent/10 border-b border-accent/30 px-6 py-2.5 text-sm flex items-center gap-3">
            <span className="font-medium text-ink">Onboarding in progress</span>
            <span className="text-ink-muted">— Step {stageIndex + 1} of {ONBOARDING_ORDER.length}: {org.onboardingStage.replace(/_/g, ' ')}</span>
            <span className="ml-auto text-xs font-mono text-ink-subtle">{Math.round((stageIndex / (ONBOARDING_ORDER.length - 1)) * 100)}%</span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
