import { forSession } from '@/lib/rls';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import ReviewsView from '@/components/portal/ReviewsView';

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const db = forSession(session);

  const reviews = await db.review.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Header title="Reviews" desc="Pulled from your aggregators — you choose what publishes to your site" pendingCount={0} />
      <RouteShell>
        <ReviewsView
          reviews={reviews.map(r => ({
            id: r.id,
            source: r.source,
            author: r.author,
            rating: r.rating,
            content: r.content,
            status: r.status,
          }))}
        />
      </RouteShell>
    </>
  );
}
