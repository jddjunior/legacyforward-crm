import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import StatGrid from '@/components/agency/StatGrid';
import Panel from '@/components/agency/Panel';
import DataTable from '@/components/agency/DataTable';
import { humanize, initials, shortDate } from '@/lib/format';
import { Users, ShieldCheck, Building2, UserCheck } from 'lucide-react';

export default async function AgencyTeamPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const users = await prisma.user.findMany({
    include: { memberships: { include: { org: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const staff = users.filter((u) => u.memberships.some((m) => m.role === 'agency_admin'));
  const clientUsers = users.filter((u) => !u.memberships.some((m) => m.role === 'agency_admin'));

  const columns = [
    {
      header: 'Person',
      className: 'font-medium text-[#14141a]',
      cell: (u: (typeof users)[number]) => (
        <span className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-[#f7f6f2] flex items-center justify-center text-[11px] font-bold text-[#5c5a52]">
            {initials(u.name || u.email)}
          </span>
          <span>{u.name || u.email.split('@')[0]}</span>
        </span>
      ),
    },
    { header: 'Email', cell: (u: (typeof users)[number]) => <span className="mono text-[12.5px]">{u.email}</span> },
    {
      header: 'Access',
      cell: (u: (typeof users)[number]) => (
        <span className="flex flex-wrap gap-1.5">
          {u.memberships.map((m) => (
            <span key={m.id} className="badge badge-gray">{humanize(m.role)} · {m.org.name}</span>
          ))}
          {u.memberships.length === 0 && <span className="text-[#918da0]">no org</span>}
        </span>
      ),
    },
    { header: 'Joined', cell: (u: (typeof users)[number]) => <span className="mono text-[12.5px]">{shortDate(u.createdAt)}</span> },
  ];

  return (
    <>
      <PageHeader title="Team" desc="Who can get into what, across the agency and every client" />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Total People', value: String(users.length), icon: Users },
            { label: 'Agency Staff', value: String(staff.length), icon: ShieldCheck },
            { label: 'Client Users', value: String(clientUsers.length), icon: UserCheck },
            { label: 'Memberships', value: String(users.reduce((n, u) => n + u.memberships.length, 0)), icon: Building2 },
          ]}
        />
        <div className="px-[26px] pt-[18px] grid gap-4 items-start">
          <Panel title="Agency staff">
            <DataTable rows={staff} columns={columns} empty="No agency admins yet." />
          </Panel>
          <Panel title="Client users">
            <DataTable rows={clientUsers} columns={columns} empty="No client users yet." />
          </Panel>
        </div>
      </div>
    </>
  );
}
