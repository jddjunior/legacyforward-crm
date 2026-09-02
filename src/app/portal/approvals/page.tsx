import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import ApprovalsView from '@/components/portal/ApprovalsView';

export default async function ApprovalsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const rows = await prisma.approval.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  const approvals = rows.map(a => {
    const content = (a.content || {}) as Record<string, unknown>;
    const body = typeof content.body === 'string' ? content.body : a.title;
    const detail = typeof content.meta === 'string' ? content.meta : '';
    return {
      id: a.id,
      kind: a.type,
      title: a.title,
      body,
      asset: `${a.type} · submitted for review`,
      status: a.status,
      meta: a.type,
      rows: [
        { k: 'Status', v: a.status },
        { k: 'Created', v: a.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
        ...(detail ? [{ k: 'Detail', v: detail }] : []),
      ],
    };
  });

  return (
    <>
      <Header title="Approvals" desc="Nothing publishes, launches, or reprices without your read" pendingCount={rows.filter(a => a.status === 'pending').length} />
      <RouteShell>
        <ApprovalsView approvals={approvals} />
      </RouteShell>
    </>
  );
}
