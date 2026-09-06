import { forSession } from '@/lib/rls';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import ContentCalendar from '@/components/portal/ContentCalendar';

export default async function AdsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const db = forSession(session);

  const posts = await db.socialPost.findMany({
    where: { orgId: session.orgId, kind: 'ad' },
    orderBy: { scheduledFor: 'asc' },
  });

  return (
    <>
      <Header title="Ads" desc="Flight calendar across search, social, CTV, programmatic" pendingCount={0} />
      <RouteShell>
        <ContentCalendar
          monthLabel={new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          posts={posts.map(p => ({
            id: p.id,
            platform: p.platform,
            title: p.title,
            copy: p.copy,
            status: p.status,
            scheduledFor: p.scheduledFor.toISOString(),
          }))}
        />
      </RouteShell>
    </>
  );
}
