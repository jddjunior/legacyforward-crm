import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

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
    <div className="p-8 max-w-3xl">
      <h1 className="text-display mb-8">Settings</h1>

      <div className="card p-6 mb-4">
        <h2 className="text-sm font-semibold mb-4">Organization</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="label mb-1">Name</div>
            <div className="font-medium">{org.name}</div>
          </div>
          <div>
            <div className="label mb-1">Onboarding Stage</div>
            <div className="font-medium capitalize">{org.onboardingStage.replace(/_/g, ' ')}</div>
          </div>
          <div>
            <div className="label mb-1">Stripe Customer ID</div>
            <div className="font-medium">{org.stripeCustomerId || 'Not connected'}</div>
          </div>
          <div>
            <div className="label mb-1">Created</div>
            <div className="font-medium">{org.createdAt.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-4">
        <h2 className="text-sm font-semibold mb-4">Your Account</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="label mb-1">Name</div>
            <div className="font-medium">{user?.name || '—'}</div>
          </div>
          <div>
            <div className="label mb-1">Email</div>
            <div className="font-medium">{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold mb-4">Team Members</h2>
        <div className="divide-y divide-ink-line">
          {memberships.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              <span className="w-8 h-8 rounded-full bg-ink-surface flex items-center justify-center text-xs font-bold">
                {m.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium">{m.user.name || m.user.email}</div>
                <div className="text-xs text-ink-muted">{m.user.email}</div>
              </div>
              <span className={`badge ${m.role === 'owner' ? 'badge-blue' : m.role === 'agency_admin' ? 'badge-green' : 'badge-gray'}`}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
