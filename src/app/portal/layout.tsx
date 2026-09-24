import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

import { ONBOARDING_STEPS, stepIndexForStage } from '@/lib/onboarding';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const memberships = await prisma.membership.findMany({
    where: { userId: session.userId },
    include: { org: true },
    orderBy: { org: { name: 'asc' } },
  });
  const org = memberships.find((m) => m.orgId === session.orgId)?.org ?? null;
  const orgs = memberships.map((m) => ({ id: m.orgId, name: m.org.name, isAgency: m.org.isAgency }));
  const isAgencyStaff = memberships.some((m) => m.role === 'agency_admin' && m.org.isAgency);
  const isActive = org?.onboardingStage === 'active' || org?.isAgency;
  const stepIndex = org ? Math.max(stepIndexForStage(org.onboardingStage), 0) : 0;
  const userName = session.name || session.email.split('@')[0];

  return (
    <div className="flex min-h-screen bg-ink-surface">
      <Sidebar
        userName={userName}
        orgName={org?.name || 'No workspace'}
        role={session.orgRole}
        orgs={orgs}
        currentOrgId={session.orgId}
        showAgencyLink={isAgencyStaff}
      />
      <main className="flex-1 min-w-0">
        {!isActive && org && (
          <div className="bg-accent/10 border-b border-accent/30 px-6 py-2.5 text-sm flex items-center gap-3">
            <span className="font-medium text-ink">Onboarding in progress</span>
            <span className="text-ink-muted">— Step {stepIndex + 1} of {ONBOARDING_STEPS.length}: {ONBOARDING_STEPS[stepIndex].label}</span>
            <a href="/portal/onboarding" className="ml-auto text-xs font-semibold text-brand">Continue setup →</a>
          </div>
        )}
        {org?.isAgency ? (
          <div className="p-8">
            <div className="card p-10 text-center max-w-lg mx-auto">
              <h1 className="text-lg font-semibold mb-2">Pick a client workspace</h1>
              <p className="text-sm text-ink-muted mb-5">You&apos;re signed in to the agency. Choose a client from the Workspace menu to view their portal, or head back to the console.</p>
              <a href="/agency" className="btn btn-primary">Open agency console</a>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
