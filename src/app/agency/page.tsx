import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { Building2, FileText, CheckSquare, Users } from 'lucide-react';

export default async function AgencyDashboard() {
  const session = await getSession();
  if (!session?.orgId) return null;

  // Get all client orgs managed by this agency
  // For now, all orgs that are not agencies
  const clients = await prisma.org.findMany({
    where: { isAgency: false },
    orderBy: { createdAt: 'desc' },
  });

  const pendingApprovals = await prisma.approval.count({
    where: { status: 'pending' },
  });

  const totalLeads = await prisma.lead.count();

  const proposals = await prisma.proposal.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { org: true },
  });

  const stats = [
    { label: 'Active Clients', value: String(clients.length), icon: Building2 },
    { label: 'Pending Approvals', value: String(pendingApprovals), icon: CheckSquare },
    { label: 'Total Leads (all)', value: String(totalLeads), icon: Users },
    { label: 'Proposals Sent', value: String(proposals.length), icon: FileText },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-display">Agency Dashboard</h1>
        <p className="text-ink-muted text-sm mt-1">Overview of all clients and operations.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className="text-brand" />
                <span className="label">{s.label}</span>
              </div>
              <div className="stat">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Clients</h2>
            <Link href="/agency/clients" className="text-xs text-brand">View all →</Link>
          </div>
          <div className="divide-y divide-ink-line">
            {clients.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-ink-surface flex items-center justify-center text-xs font-bold">
                  {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-ink-muted">{c.onboardingStage.replace(/_/g, ' ')}</div>
                </div>
                <span className={`badge ${c.onboardingStage === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                  {c.onboardingStage === 'active' ? 'active' : 'onboarding'}
                </span>
              </div>
            ))}
            {clients.length === 0 && <div className="text-sm text-ink-muted py-6 text-center">No clients yet.</div>}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Proposals</h2>
            <Link href="/agency/proposals" className="text-xs text-brand">View all →</Link>
          </div>
          <div className="divide-y divide-ink-line">
            {proposals.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <FileText size={16} className="text-ink-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-ink-muted">{p.org.name}</div>
                </div>
                <span className={`badge ${p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>
                  {p.status}
                </span>
                {p.status === 'approved' && (
                  <Link href={`/pitch/${p.token}`} className="text-xs text-brand">View →</Link>
                )}
              </div>
            ))}
            {proposals.length === 0 && <div className="text-sm text-ink-muted py-6 text-center">No proposals yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
