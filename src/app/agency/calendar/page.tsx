import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import Panel, { EmptyState } from '@/components/agency/Panel';
import { badgeClass, humanize } from '@/lib/format';

export default async function AgencyCalendarPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const posts = await prisma.socialPost.findMany({
    include: { org: true },
    orderBy: { scheduledFor: 'asc' },
  });

  const byDay = new Map<string, typeof posts>();
  for (const post of posts) {
    const key = post.scheduledFor.toISOString().slice(0, 10);
    byDay.set(key, [...(byDay.get(key) ?? []), post]);
  }

  const dayLabel = (key: string) =>
    new Date(`${key}T12:00:00Z`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
    });

  return (
    <>
      <PageHeader title="Calendar" desc={`${posts.length} scheduled items across every client`} />
      <div className="flex-1 min-w-0 px-[26px] pb-[26px]">
        {byDay.size === 0 ? (
          <Panel><EmptyState>Nothing scheduled yet.</EmptyState></Panel>
        ) : (
          <div className="space-y-4">
            {[...byDay.entries()].map(([day, items]) => (
              <Panel key={day} title={dayLabel(day)}>
                <div className="divide-y divide-[#efede7]">
                  {items.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#f7f6f2] transition-colors">
                      <span className="mono text-[11.5px] font-semibold text-[#14141a] w-[62px] flex-shrink-0">
                        {p.scheduledFor.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })}
                      </span>
                      <span className="mono text-[10.5px] uppercase tracking-[0.1em] text-[#5c5a52] w-[92px] flex-shrink-0">
                        {humanize(p.platform)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-semibold text-[#14141a] truncate">{p.title}</div>
                        <div className="text-[12px] text-[#5f5f66] mt-0.5">{p.org.name} · {humanize(p.kind)}</div>
                      </div>
                      <span className={badgeClass(p.status)}>{humanize(p.status)}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
