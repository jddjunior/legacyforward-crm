import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Header from '@/components/portal/Header';
import RouteShell from '@/components/portal/RouteShell';
import CallsView from '@/components/portal/CallsView';

export default async function LiveCallsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const calls = await prisma.callRecord.findMany({
    where: { orgId: session.orgId },
    orderBy: { startedAt: 'desc' },
    take: 30,
  });

  const order = { live: 0, ended: 1, missed: 2 } as Record<string, number>;
  const sorted = [...calls].sort(
    (a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3) || b.startedAt.getTime() - a.startedAt.getTime()
  );

  return (
    <>
      <Header title="Live Calls" desc="Real-time coaching on the call happening right now" pendingCount={0} />
      <RouteShell>
        <CallsView
          calls={sorted.map(c => ({
            id: c.id,
            callerName: c.callerName,
            phone: c.phone,
            repName: c.repName,
            durationSec: c.durationSec,
            status: c.status,
            sentiment: c.sentiment,
            summary: c.summary,
            startedAt: c.startedAt.toISOString(),
            transcript: (c.transcript as { who: string; text: string }[]) || [],
          }))}
        />
      </RouteShell>
    </>
  );
}
