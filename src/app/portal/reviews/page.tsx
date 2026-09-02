import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const reviews = await prisma.review.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <h1 className="text-display mb-6">Reviews</h1>
      {reviews.length === 0 ? (
        <div className="card p-12 text-center text-ink-muted">No reviews yet.</div>
      ) : (
        <div className="grid gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="badge badge-gray capitalize">{r.source}</span>
                <span className="text-sm font-medium">{r.author}</span>
                <span className="text-xs text-ink-muted">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span className={`badge ml-auto ${r.status === 'approved' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span>
              </div>
              <p className="text-sm text-ink-muted">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
