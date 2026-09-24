import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { addReview, setReviewStatus, deleteReview } from '@/app/actions/reviews';
import { PageHeader, NewItemPanel, Field, Empty, StatCard, StatusBadge, ActionButton } from '@/components/ui';
import { shortDate } from '@/lib/format';

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const reviews = await prisma.review.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader title="Reviews" subtitle="Approve reviews before they're featured on your site and socials." />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Average rating" value={String(avg)} icon={Star} hint={`${reviews.length} reviews`} />
        <StatCard label="Awaiting approval" value={String(reviews.filter((r) => r.status === 'pending').length)} icon={MessageSquare} />
        <StatCard label="Published" value={String(reviews.filter((r) => r.status === 'published').length)} icon={CheckCircle} />
      </div>

      <NewItemPanel label="Add Review">
        <form action={addReview} className="grid grid-cols-4 gap-3">
          <Field label="Author *"><input name="author" required className="input" placeholder="Jane D." /></Field>
          <Field label="Source">
            <select name="source" className="input">
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="yelp">Yelp</option>
            </select>
          </Field>
          <Field label="Rating">
            <select name="rating" className="input" defaultValue="5">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
            </select>
          </Field>
          <div />
          <Field label="Review" className="col-span-4"><textarea name="content" rows={2} className="input h-auto py-2" /></Field>
          <div className="col-span-4 flex justify-end"><button type="submit" className="btn btn-primary">Add Review</button></div>
        </form>
      </NewItemPanel>

      {reviews.length === 0 ? (
        <Empty>No reviews yet.</Empty>
      ) : (
        <div className="grid gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="badge badge-gray capitalize">{r.source}</span>
                <span className="text-sm font-medium">{r.author}</span>
                <span className="text-sm text-accent">{'★'.repeat(r.rating)}<span className="text-ink-line">{'★'.repeat(5 - r.rating)}</span></span>
                <span className="text-xs text-ink-muted">{shortDate(r.createdAt)}</span>
                <span className="ml-auto"><StatusBadge status={r.status} /></span>
              </div>
              {r.content && <p className="text-sm text-ink-muted mb-3">{r.content}</p>}
              <div className="flex items-center gap-2">
                {r.status === 'pending' && <ActionButton action={setReviewStatus.bind(null, r.id, 'approved')} tone="primary">Approve</ActionButton>}
                {r.status === 'approved' && <ActionButton action={setReviewStatus.bind(null, r.id, 'published')} tone="primary">Publish</ActionButton>}
                {r.status !== 'pending' && <ActionButton action={setReviewStatus.bind(null, r.id, 'pending')}>Unpublish</ActionButton>}
                <div className="ml-auto"><ActionButton action={deleteReview.bind(null, r.id)} tone="danger">Delete</ActionButton></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
