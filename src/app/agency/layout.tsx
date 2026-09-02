import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { signSession } from '@/lib/session';
import AgencySidebar from '@/components/AgencySidebar';

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/api/auth/login');

  const membership = await prisma.membership.findFirst({
    where: { userId: session.userId, role: 'agency_admin' },
    include: { org: true },
  });

  if (!membership) redirect('/portal');

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

  const userName = session.name || session.email.split('@')[0];

  return (
    <div className="min-h-screen bg-[#e6e3dc] p-[14px]">
      <div className="flex items-stretch min-h-[calc(100vh-28px)] bg-[#f6f5f1] rounded-[13px] overflow-hidden border border-[#dcd8cf]">
        <AgencySidebar userName={userName} pendingCount={0} />
        <main className="flex-1 min-w-0 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
