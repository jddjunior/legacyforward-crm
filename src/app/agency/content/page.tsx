import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import StatGrid from '@/components/agency/StatGrid';
import Panel, { EmptyState } from '@/components/agency/Panel';
import { badgeClass, humanize, dateTime } from '@/lib/format';
import { Megaphone, Clock, CheckCircle2, MessageSquareWarning } from 'lucide-react';

export default async function AgencyContentPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const posts = await prisma.socialPost.findMany({
    where: { kind: 'social' },
    include: { org: true },
    orderBy: { scheduledFor: 'desc' },
  });

  const count = (status: string) => posts.filter((p) => p.status === status).length;

  return (
    <>
      <PageHeader
        title="Content studio"
        desc="Every social post the agency has drafted, and where it stands"
        pendingCount={count('awaiting_approval')}
      />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Total Posts', value: String(posts.length), icon: Megaphone },
            { label: 'Awaiting Client', value: String(count('awaiting_approval')), icon: Clock },
            { label: 'Approved', value: String(count('approved')), icon: CheckCircle2 },
            { label: 'Changes Asked', value: String(count('changes_requested')), icon: MessageSquareWarning },
          ]}
        />
        <div className="px-[26px] pt-[18px]">
          <Panel title="All content">
            {posts.length === 0 ? (
              <EmptyState>No content drafted yet.</EmptyState>
            ) : (
              <div className="grid gap-3.5 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {posts.map((p) => (
                  <article key={p.id} className="rounded-[11px] border border-[#eeece6] bg-[#faf9f6] p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#5c5a52]">
                        {humanize(p.platform)}
                      </span>
                      <span className={`${badgeClass(p.status)} ml-auto`}>{humanize(p.status)}</span>
                    </div>
                    <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#14141a]">{p.title}</h3>
                    {p.copy && <p className="text-[12.5px] text-[#5f5f66] mt-1.5 line-clamp-4">{p.copy}</p>}
                    <div className="mt-3 pt-3 border-t border-[#eeece6] flex items-center gap-2">
                      <span className="text-[12px] font-medium text-[#14141a] truncate">{p.org.name}</span>
                      <span className="ml-auto mono text-[11px] text-[#918da0] flex-shrink-0">{dateTime(p.scheduledFor)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
