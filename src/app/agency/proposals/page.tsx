import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default async function AgencyProposalsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const proposals = await prisma.proposal.findMany({
    include: { org: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader title="Proposals" desc="Website pitches out in the world and what they are doing" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px]">
        {proposals.length === 0 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] px-5 py-16 text-center text-[13px] text-[#6b6b74]">
            No proposals yet. Proposals are created when you pitch a website build to a client.
          </div>
        ) : (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden divide-y divide-[#efede7]">
            {proposals.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7f6f2] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-[#14141a]">{p.title}</div>
                  <div className="text-[12px] text-[#5f5f66] mt-0.5">{p.org.name} · {p.createdAt.toLocaleDateString()}</div>
                </div>
                <span className={`badge ${p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>{p.status}</span>
                <Link href={`/pitch/${p.token}`} className="text-[12.5px] font-medium text-[#146c43] hover:text-[#0f5132]">Open pitch link →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
