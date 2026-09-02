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

  const [pendingCount, docCount] = await Promise.all([
    prisma.approval.count({ where: { orgId: session.orgId, status: 'pending' } }),
    prisma.document.count({ where: { orgId: session.orgId } }),
  ]);
  const wikiPct = docCount > 0 ? Math.min(100, Math.round((docCount / 8) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#e6e3dc] p-[14px]">
      <div className="flex items-stretch min-h-[calc(100vh-28px)] bg-[#f6f5f1] rounded-[13px] overflow-hidden border border-[#dcd8cf]">
        <Sidebar userName={userName} orgName={org?.name || 'Loading…'} pendingCount={pendingCount} wikiPct={wikiPct} />
        <main className="flex-1 min-w-0 flex flex-col">
          {!isActive && org && (
            <div className="border-b border-[#e9e6de] bg-[#fff3d1]/40 px-7 py-2.5 text-[13px] flex items-center gap-3">
              <span className="font-medium text-[#14141a]">Onboarding in progress</span>
              <span className="text-[#5f5f66]">— Step {stageIndex + 1} of {ONBOARDING_ORDER.length}: {org.onboardingStage.replace(/_/g, ' ')}</span>
              <a href="/portal/onboarding" className="ml-auto text-[12.5px] font-semibold text-[#146c43] hover:text-[#0f5132]">Continue setup →</a>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
