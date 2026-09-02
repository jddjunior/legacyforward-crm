import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { Building2, FileText, CheckSquare, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default async function AgencyDashboard() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [clients, pendingApprovals, totalLeads, proposals] = await Promise.all([
    prisma.org.findMany({ where: { isAgency: false }, orderBy: { createdAt: 'desc' } }),
    prisma.approval.count({ where: { status: 'pending' } }),
    prisma.lead.count(),
    prisma.proposal.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { org: true } }),
  ]);

  const stats = [
    { label: 'Active Clients', value: String(clients.length), icon: Building2 },
    { label: 'Pending Approvals', value: String(pendingApprovals), icon: CheckSquare },
    { label: 'Total Leads', value: String(totalLeads), icon: Users },
    { label: 'Proposals Sent', value: String(proposals.length), icon: FileText },
  ];

  return (
    <>
      <PageHeader title="Agency overview" desc={`${clients.length} accounts and what needs you before lunch`} pendingCount={pendingApprovals} />
      <div className="flex-1 min-w-0">
        <div className="px-[26px] grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))' }}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white border border-[#eeece6] rounded-[13px] p-5">
                <div className="flex items-center gap-[11px] mb-4">
                  <span className="w-[38px] h-[38px] rounded-full bg-[#e8f3ec] flex items-center justify-center">
                    <Icon size={19} strokeWidth={1.8} className="text-[#146c43]" />
                  </span>
                  <span className="mono text-[11px] font-medium tracking-[0.13em] uppercase text-[#5c5a52]">{s.label}</span>
                </div>
                <div className="text-[38px] font-semibold tracking-[-0.045em] leading-1 text-[#14141a]">{s.value}</div>
              </div>
            );
          })}
        </div>

        <div className="px-[26px] pt-[18px] grid gap-4 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
          <section className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
            <div className="h-[52px] flex items-center gap-2.5 px-5">
              <span className="text-[17px] font-semibold tracking-[-0.015em]">Clients</span>
              <Link href="/agency/clients" className="ml-auto text-[12.5px] font-medium text-[#146c43] hover:text-[#0f5132]">View all</Link>
            </div>
            <div className="divide-y divide-[#efede7]">
              {clients.slice(0, 6).map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f7f6f2] transition-colors">
                  <span className="w-8 h-8 rounded-full bg-[#f7f6f2] flex items-center justify-center text-[11px] font-bold text-[#5c5a52]">
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium text-[#14141a] truncate">{c.name}</div>
                    <div className="text-[12px] text-[#5f5f66]">{c.onboardingStage.replace(/_/g, ' ')}</div>
                  </div>
                  <span className={`badge ${c.onboardingStage === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                    {c.onboardingStage === 'active' ? 'active' : 'onboarding'}
                  </span>
                </div>
              ))}
              {clients.length === 0 && <div className="px-5 py-10 text-center text-[13px] text-[#6b6b74]">No clients yet.</div>}
            </div>
          </section>

          <section className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
            <div className="h-[52px] flex items-center gap-2.5 px-5">
              <span className="text-[17px] font-semibold tracking-[-0.015em]">Recent Proposals</span>
              <Link href="/agency/proposals" className="ml-auto text-[12.5px] font-medium text-[#146c43] hover:text-[#0f5132]">View all</Link>
            </div>
            <div className="divide-y divide-[#efede7]">
              {proposals.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f7f6f2] transition-colors">
                  <FileText size={16} strokeWidth={1.7} className="text-[#5f5f66] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium text-[#14141a] truncate">{p.title}</div>
                    <div className="text-[12px] text-[#5f5f66]">{p.org.name}</div>
                  </div>
                  <span className={`badge ${p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>{p.status}</span>
                </div>
              ))}
              {proposals.length === 0 && <div className="px-5 py-10 text-center text-[13px] text-[#6b6b74]">No proposals yet.</div>}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
