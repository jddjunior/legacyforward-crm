import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import PageHeader from '@/components/PageHeader';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const org = await prisma.org.findUnique({ where: { id: session.orgId } });
  const initials = (session.name || session.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <PageHeader title="Profile" desc="Account details and portal access" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px] bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
        <div className="p-6">
          {/* User card */}
          <div className="flex items-center gap-4 pb-6 border-b border-[#efede7]">
            <span className="w-16 h-16 rounded-full bg-[#14141a] text-white flex items-center justify-center text-xl font-semibold">{initials}</span>
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.02em]">{session.name || 'User'}</div>
              <div className="text-[13px] text-[#6b6b74] mt-0.5">{session.email}</div>
              <span className="badge badge-green mt-2">Owner</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-6 pt-6">
            <div>
              <div className="label mb-2">Organization</div>
              <div className="text-[14px] font-medium">{org?.name || '—'}</div>
            </div>
            <div>
              <div className="label mb-2">Onboarding stage</div>
              <div className="text-[14px] font-medium capitalize">{org?.onboardingStage?.replace(/_/g, ' ') || '—'}</div>
            </div>
            <div>
              <div className="label mb-2">Role</div>
              <div className="text-[14px] font-medium">{session.role || 'owner'}</div>
            </div>
            <div>
              <div className="label mb-2">Member since</div>
              <div className="text-[14px] font-medium mono">{org?.createdAt ? org.createdAt.toLocaleDateString() : '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
