import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

import { ONBOARDING_STEPS, stepIndexForStage } from '@/lib/onboarding';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/api/auth/login');

  const org = session.orgId ? await prisma.org.findUnique({ where: { id: session.orgId } }) : null;
  const isActive = org?.onboardingStage === 'active';
  const stepIndex = org ? Math.max(stepIndexForStage(org.onboardingStage), 0) : 0;
  const userName = session.name || session.email.split('@')[0];

  return (
    <div className="flex min-h-screen bg-ink-surface">
      <Sidebar userName={userName} orgName={org?.name || 'Loading…'} badge={null} />
      <main className="flex-1 min-w-0">
        {!isActive && org && (
          <div className="bg-accent/10 border-b border-accent/30 px-6 py-2.5 text-sm flex items-center gap-3">
            <span className="font-medium text-ink">Onboarding in progress</span>
            <span className="text-ink-muted">— Step {stepIndex + 1} of {ONBOARDING_STEPS.length}: {ONBOARDING_STEPS[stepIndex].label}</span>
            <a href="/portal/onboarding" className="ml-auto text-xs font-semibold text-brand">Continue setup →</a>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
