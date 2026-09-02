import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const org = await prisma.org.findUnique({ where: { id: session.orgId } });
  if (!org) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const memberships = await prisma.membership.findMany({
    where: { orgId: session.orgId },
    include: { user: true },
  });

  return (
    <>
      <PageHeader title="Settings" desc="Notifications, approval rules, automation limits" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px] max-w-3xl">
        <div className="bg-white border border-[#e9e6de] rounded-[13px] p-6 mb-4">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-4">Organization</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="label mb-1">Name</div>
              <div className="font-medium text-[#14141a]">{org.name}</div>
            </div>
            <div>
              <div className="label mb-1">Onboarding Stage</div>
              <div className="font-medium text-[#14141a] capitalize">{org.onboardingStage.replace(/_/g, ' ')}</div>
            </div>
            <div>
              <div className="label mb-1">Stripe Customer ID</div>
              <div className="font-medium text-[#14141a] mono text-[12.5px]">{org.stripeCustomerId || 'Not connected'}</div>
            </div>
            <div>
              <div className="label mb-1">Created</div>
              <div className="font-medium text-[#14141a] mono text-[12.5px]">{org.createdAt.toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e9e6de] rounded-[13px] p-6 mb-4">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-4">Your Account</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="label mb-1">Name</div>
              <div className="font-medium text-[#14141a]">{user?.name || '—'}</div>
            </div>
            <div>
              <div className="label mb-1">Email</div>
              <div className="font-medium text-[#14141a]">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e9e6de] rounded-[13px] p-6">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-4">Team Members</h2>
          <div className="divide-y divide-[#efede7]">
            {memberships.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-3">
                <span className="w-8 h-8 rounded-full bg-[#f7f6f2] flex items-center justify-center text-[11px] font-bold text-[#5c5a52]">
                  {m.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                </span>
                <div className="flex-1">
                  <div className="text-[13.5px] font-medium text-[#14141a]">{m.user.name || m.user.email}</div>
                  <div className="text-[12px] text-[#5f5f66]">{m.user.email}</div>
                </div>
                <span className={`badge ${m.role === 'owner' ? 'badge-green' : m.role === 'agency_admin' ? 'badge-yellow' : 'badge-gray'}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
