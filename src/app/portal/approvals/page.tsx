import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { approveItem, rejectItem } from '@/app/actions/approvals';

export default async function ApprovalsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const approvals = await prisma.approval.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  const pending = approvals.filter(a => a.status === 'pending');

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-display">Approvals</h1>
        <p className="text-ink-muted text-sm mt-1">{pending.length} pending · {approvals.length} total</p>
      </div>

      {approvals.length === 0 ? (
        <div className="card p-12 text-center text-ink-muted">No approval requests yet.</div>
      ) : (
        <div className="grid gap-3">
          {approvals.map((a) => (
            <div key={a.id} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-ink-surface flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-mono uppercase">{a.type.slice(0, 3)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-ink-muted mt-0.5 capitalize">{a.type} · {a.createdAt.toLocaleDateString()}</div>
              </div>
              <span className={`badge ${a.status === 'approved' ? 'badge-green' : a.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                {a.status}
              </span>
              {a.status === 'pending' && (
                <div className="flex gap-2">
                  <form action={() => approveItem(a.id)}>
                    <button type="submit" className="btn btn-primary text-xs h-8 px-3">Approve</button>
                  </form>
                  <form action={() => rejectItem(a.id)}>
                    <button type="submit" className="btn text-xs h-8 px-3 text-red-600 border-red-200">Reject</button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
