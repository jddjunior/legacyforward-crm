import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Panel, { EmptyState } from '@/components/agency/Panel';
import { badgeClass, humanize, shortDate } from '@/lib/format';

type QueueItem = {
  id: string;
  kind: string;
  title: string;
  client: string;
  status: string;
  createdAt: Date;
  href: string;
};

export default async function AgencyQueuePage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [approvals, posts, changeRequests] = await Promise.all([
    prisma.approval.findMany({ where: { status: 'pending' }, include: { org: true }, orderBy: { createdAt: 'asc' } }),
    prisma.socialPost.findMany({ where: { status: 'awaiting_approval' }, include: { org: true }, orderBy: { scheduledFor: 'asc' } }),
    prisma.changeRequest.findMany({
      where: { status: 'pending' },
      include: { proposal: { include: { org: true } } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const items: QueueItem[] = [
    ...approvals.map((a) => ({
      id: `a-${a.id}`, kind: a.type, title: a.title, client: a.org.name,
      status: a.status, createdAt: a.createdAt, href: '/agency/approvals',
    })),
    ...posts.map((p) => ({
      id: `p-${p.id}`, kind: p.kind, title: p.title, client: p.org.name,
      status: p.status, createdAt: p.createdAt, href: '/agency/content',
    })),
    ...changeRequests.map((c) => ({
      id: `c-${c.id}`, kind: 'change request', title: c.request, client: c.proposal.org.name,
      status: c.status, createdAt: c.createdAt, href: `/pitch/${c.proposal.token}`,
    })),
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <>
      <PageHeader title="Work queue" desc="Everything waiting on the agency, oldest first" pendingCount={items.length} />
      <div className="flex-1 min-w-0 px-[26px] pb-[26px]">
        <Panel title={`${items.length} open item${items.length === 1 ? '' : 's'}`}>
          {items.length === 0 ? (
            <EmptyState>Queue is clear. Nothing is waiting on you.</EmptyState>
          ) : (
            <div className="divide-y divide-[#efede7]">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7f6f2] transition-colors">
                  <span className="mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#5c5a52] w-[110px] flex-shrink-0">
                    {humanize(item.kind)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-[#14141a] truncate">{item.title}</div>
                    <div className="text-[12px] text-[#5f5f66] mt-0.5">{item.client} · {shortDate(item.createdAt)}</div>
                  </div>
                  <span className={badgeClass(item.status)}>{humanize(item.status)}</span>
                  <Link href={item.href} className="text-[12.5px] font-medium text-[#146c43] hover:text-[#0f5132] flex-shrink-0">
                    Review →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
