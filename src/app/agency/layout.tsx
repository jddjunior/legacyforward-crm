import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import AgencySidebar from '@/components/AgencySidebar';

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login?next=/agency');

  const memberships = await prisma.membership.findMany({
    where: { userId: session.userId },
    include: { org: true },
    orderBy: { org: { name: 'asc' } },
  });
  if (!memberships.some((m) => m.role === 'agency_admin' && m.org.isAgency)) redirect('/portal');

  const orgs = memberships.map((m) => ({ id: m.orgId, name: m.org.name, isAgency: m.org.isAgency }));

  return (
    <div className="flex min-h-screen bg-ink-surface">
      <AgencySidebar orgs={orgs} currentOrgId={session.orgId} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
