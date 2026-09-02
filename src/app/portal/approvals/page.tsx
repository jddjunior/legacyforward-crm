import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { approveItem, rejectItem } from '@/app/actions/approvals';
import PageHeader from '@/components/PageHeader';

export default async function ApprovalsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const approvals = await prisma.approval.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  const pending = approvals.filter(a => a.status === 'pending');

  return (
    <>
      <PageHeader title="Approvals" desc={`${pending.length} pending · ${approvals.length} total`} pendingCount={pending.length} />
      <div className="m-0 mx-[26px] mb-[26px] bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
        {approvals.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-[#6b6b74]">No approval requests yet.</div>
        ) : (
          <div className="divide-y divide-[#efede7]">
            {approvals.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7f6f2] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#f7f6f2] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] mono uppercase text-[#5c5a52] font-semibold">{a.type.slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-[#14141a]">{a.title}</div>
                  <div className="text-[12.5px] text-[#5f5f66] mt-0.5 capitalize">{a.type} · {a.createdAt.toLocaleDateString()}</div>
                </div>
                <span className={`badge ${a.status === 'approved' ? 'badge-green' : a.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                  {a.status}
                </span>
                {a.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <form action={() => approveItem(a.id)}>
                      <button type="submit" className="btn btn-primary text-xs h-8 px-3">Approve</button>
                    </form>
                    <form action={() => rejectItem(a.id)}>
                      <button type="submit" className="btn text-xs h-8 px-3 text-[#b02a12] border-[#e6e2d8]">Reject</button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
