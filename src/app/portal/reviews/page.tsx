import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const reviews = await prisma.review.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader title="Reviews" desc={`${reviews.length} total`} pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px]">
        {reviews.length === 0 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] px-5 py-16 text-center text-[13px] text-[#6b6b74]">No reviews yet.</div>
        ) : (
          <div className="grid gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-[#e9e6de] rounded-[13px] p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="badge badge-gray capitalize">{r.source}</span>
                  <span className="text-[13.5px] font-medium text-[#14141a]">{r.author}</span>
                  <span className="text-xs text-[#8a5a00]">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className={`badge ml-auto ${r.status === 'approved' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span>
                </div>
                <p className="text-[13px] text-[#5f5f66] leading-relaxed">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
