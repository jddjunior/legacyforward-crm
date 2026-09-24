import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createPost, setPostStatus, requestPostApproval, deletePost } from '@/app/actions/social';
import { PageHeader, NewItemPanel, Field, Empty, StatusBadge, ActionButton } from '@/components/ui';
import { dateTime } from '@/lib/format';

const PLATFORMS: Record<string, string> = {
  facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', google: 'Google Business',
};

export default async function SocialsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [posts, pendingApprovals] = await Promise.all([
    prisma.socialPost.findMany({ where: { orgId: session.orgId }, orderBy: { scheduledAt: 'asc' } }),
    prisma.approval.findMany({ where: { orgId: session.orgId, type: 'social', status: 'pending' } }),
  ]);
  const awaiting = new Set(pendingApprovals.map((a) => (a.content as { socialPostId?: string } | null)?.socialPostId));

  // Group posts into a day-by-day calendar.
  const days = new Map<string, typeof posts>();
  for (const p of posts) {
    const key = p.scheduledAt.toDateString();
    days.set(key, [...(days.get(key) || []), p]);
  }
  const today = new Date().toDateString();

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Socials"
        subtitle={`${posts.filter((p) => p.status === 'scheduled').length} scheduled · ${posts.filter((p) => p.status === 'draft').length} drafts`}
      />

      <NewItemPanel label="New Post">
        <form action={createPost} className="grid grid-cols-4 gap-3">
          <Field label="Platform">
            <select name="platform" className="input">
              {Object.entries(PLATFORMS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Publish at *"><input name="scheduledAt" type="datetime-local" required className="input" /></Field>
          <Field label="Save as">
            <select name="status" className="input">
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </Field>
          <div />
          <Field label="Post copy *" className="col-span-4">
            <textarea name="content" required rows={3} className="input h-auto py-2" placeholder="What should we post?" />
          </Field>
          <div className="col-span-4 flex justify-end"><button type="submit" className="btn btn-primary">Save Post</button></div>
        </form>
      </NewItemPanel>

      {posts.length === 0 ? (
        <Empty>No posts on the calendar yet.</Empty>
      ) : (
        <div className="flex flex-col gap-6">
          {[...days.entries()].map(([day, items]) => (
            <section key={day}>
              <h2 className="label mb-2">{day === today ? 'Today' : day}</h2>
              <div className="grid gap-3">
                {items.map((p) => (
                  <div key={p.id} className="card p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="badge badge-gray">{PLATFORMS[p.platform] || p.platform}</span>
                      <StatusBadge status={p.status} />
                      {awaiting.has(p.id) && <span className="badge badge-yellow">awaiting approval</span>}
                      <span className="text-xs text-ink-muted ml-auto">{dateTime(p.scheduledAt)}</span>
                    </div>
                    <p className="text-sm mb-3 whitespace-pre-wrap">{p.content}</p>
                    <div className="flex items-center gap-2">
                      {p.status === 'draft' && !awaiting.has(p.id) && (
                        <ActionButton action={requestPostApproval.bind(null, p.id)}>Send for approval</ActionButton>
                      )}
                      {p.status === 'draft' && <ActionButton action={setPostStatus.bind(null, p.id, 'scheduled')} tone="primary">Schedule</ActionButton>}
                      {p.status === 'scheduled' && (
                        <>
                          <ActionButton action={setPostStatus.bind(null, p.id, 'published')} tone="primary">Mark published</ActionButton>
                          <ActionButton action={setPostStatus.bind(null, p.id, 'draft')}>Unschedule</ActionButton>
                        </>
                      )}
                      <div className="ml-auto"><ActionButton action={deletePost.bind(null, p.id)} tone="danger">Delete</ActionButton></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
