import { forSession } from '@/lib/rls';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import DocumentsView from '@/components/portal/DocumentsView';

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const db = forSession(session);

  const docs = await db.document.findMany({
    where: { orgId: session.orgId },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <>
      <Header title="Documents" desc="Your brand wiki — searchable, indexed for retrieval" pendingCount={0} />
      <RouteShell>
        <DocumentsView
          docs={docs.map(d => ({
            id: d.id,
            title: d.title,
            category: d.category,
            size: d.size,
            status: d.status,
            updated: d.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            content: d.content,
          }))}
        />
      </RouteShell>
    </>
  );
}
