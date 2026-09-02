import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, Building2, FileText, CheckSquare, Phone, Settings } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { signSession } from '@/lib/session';
import { OrgProvider } from '@/components/org-context';

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
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-ink-line bg-ink-surface h-screen sticky top-0">
        <div className="h-[72px] flex items-center gap-3 px-5">
          <span className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-xs">LF</span>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">LegacyForward</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">Agency Console</div>
          </div>
        </div>
        <nav className="flex-1 px-3 flex flex-col gap-0.5 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Active check is client-side; for SSR just render
            return (
              <Link
                key={item.id}
                href={item.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium text-ink hover:bg-ink-line/50 transition-colors"
              >
                <Icon size={16} className="flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <Link href="/portal" className="btn btn-ghost w-full justify-center text-xs">
            Switch to Client Portal
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
