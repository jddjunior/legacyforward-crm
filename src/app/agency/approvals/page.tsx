import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { approveItem, rejectItem } from '@/app/actions/approvals';
import PageHeader from '@/components/PageHeader';

export default async function AgencyApprovalsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const approvals = await prisma.approval.findMany({
    where: { status: 'pending' },
    include: { org: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader title="Approvals Queue" desc={`${approvals.length} pending across all clients`} pendingCount={approvals.length} />
      <div className="m-0 mx-[26px] mb-[26px]">
        {approvals.length === 0 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] px-5 py-16 text-center text-[13px] text-[#6b6b74]">No pending approvals across all clients.</div>
        ) : (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden divide-y divide-[#efede7]">
            {approvals.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7f6f2] transition-colors">
                <span className="badge badge-yellow capitalize">{a.type}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-[#14141a]">{a.title}</div>
                  <div className="text-[12px] text-[#5f5f66] mt-0.5">{a.org.name}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <form action={() => approveItem(a.id)}>
                    <button type="submit" className="btn btn-primary text-xs h-8 px-3">Approve</button>
                  </form>
                  <form action={() => rejectItem(a.id)}>
                    <button type="submit" className="btn text-xs h-8 px-3 text-[#b02a12] border-[#e6e2d8]">Reject</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
