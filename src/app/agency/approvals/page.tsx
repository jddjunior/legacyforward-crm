import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { approveItem, rejectItem } from '@/app/actions/approvals';
import Link from 'next/link';

export default async function AgencyApprovalsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const approvals = await prisma.approval.findMany({
    where: { status: 'pending' },
    include: { org: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <h1 className="text-display mb-6">Approvals Queue</h1>
      {approvals.length === 0 ? (
        <div className="card p-12 text-center text-ink-muted">No pending approvals across all clients.</div>
      ) : (
        <div className="grid gap-3">
          {approvals.map((a) => (
            <div key={a.id} className="card p-5 flex items-center gap-4">
              <span className="badge badge-yellow capitalize">{a.type}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-ink-muted">{a.org.name}</div>
              </div>
              <div className="flex gap-2">
                <form action={() => approveItem(a.id)}>
                  <button type="submit" className="btn btn-primary text-xs h-8 px-3">Approve</button>
                </form>
                <form action={() => rejectItem(a.id)}>
                  <button type="submit" className="btn text-xs h-8 px-3 text-red-600 border-red-200">Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
