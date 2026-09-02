import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { TrendingUp, Users, GitBranch, CheckSquare } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [leads, customers, deals, approvals] = await Promise.all([
    prisma.lead.count({ where: { orgId: session.orgId } }),
    prisma.customer.count({ where: { orgId: session.orgId } }),
    prisma.deal.findMany({ where: { orgId: session.orgId } }),
    prisma.approval.count({ where: { orgId: session.orgId, status: 'pending' } }),
  ]);

  const pipelineValue = deals
    .filter(d => !['won', 'lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);

  const stats = [
    { label: 'Total Leads', value: String(leads), icon: Users, color: 'text-brand' },
    { label: 'Customers', value: String(customers), icon: Users, color: 'text-green-600' },
    { label: 'Pipeline Value', value: `$${(pipelineValue / 100).toLocaleString()}`, icon: GitBranch, color: 'text-orange-600' },
    { label: 'Won Revenue', value: `$${(wonValue / 100).toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Pending Approvals', value: String(approvals), icon: CheckSquare, color: 'text-accent' },
  ];

  const recentLeads = await prisma.lead.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-display">Dashboard</h1>
        <p className="text-ink-muted text-sm mt-1">At-a-glance overview of your CRM and pipeline.</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className={s.color} />
                <span className="label">{s.label}</span>
              </div>
              <div className="stat">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="text-sm font-semibold mb-4">Recent Leads</h2>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-ink-muted py-8 text-center">No leads yet.</p>
          ) : (
            <div className="divide-y divide-ink-line">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-ink-surface flex items-center justify-center text-xs font-bold text-ink-muted">
                    {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{lead.name}</div>
                    <div className="text-xs text-ink-muted">{lead.source || 'organic'}</div>
                  </div>
                  <span className={`badge ${lead.status === 'qualified' ? 'badge-green' : lead.status === 'lost' ? 'badge-red' : 'badge-gray'}`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold mb-4">Pipeline Snapshot</h2>
          {deals.length === 0 ? (
            <p className="text-sm text-ink-muted py-8 text-center">No deals yet.</p>
          ) : (
            <div className="space-y-3">
              {['lead', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((stage) => {
                const stageDeals = deals.filter(d => d.stage === stage);
                if (stageDeals.length === 0) return null;
                const total = stageDeals.reduce((s, d) => s + d.value, 0);
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24 capitalize">{stage}</span>
                    <div className="flex-1 h-7 bg-ink-surface rounded-lg relative overflow-hidden">
                      <div
                        className="h-full bg-brand/15 rounded-lg"
                        style={{ width: `${Math.max(10, (stageDeals.length / deals.length) * 100)}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-3 text-xs font-medium">
                        {stageDeals.length} deals · ${(total / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
