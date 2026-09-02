import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Building2, FileText, CheckSquare } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { signSession } from '@/lib/session';

const navItems = [
  { id: '/agency', label: 'Dashboard', icon: LayoutDashboard },
  { id: '/agency/clients', label: 'Clients', icon: Building2 },
  { id: '/agency/proposals', label: 'Proposals', icon: FileText },
  { id: '/agency/approvals', label: 'Approvals Queue', icon: CheckSquare },
];

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/api/auth/login');

  // Find agency org for this user
  const membership = await prisma.membership.findFirst({
    where: { userId: session.userId, role: 'agency_admin' },
    include: { org: true },
  });

  if (!membership) redirect('/portal');

  // Update session orgId if needed
  if (session.orgId !== membership.orgId) {
    const newToken = await signSession({
      ...session,
      orgId: membership.orgId,
      orgRole: 'agency_admin',
    });
    cookies().set('lf-session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  return (
    <div className="flex min-h-screen bg-ink-surface">
      <AgencySidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
