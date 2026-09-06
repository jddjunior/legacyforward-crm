import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import StatGrid from '@/components/agency/StatGrid';
import Panel, { EmptyState } from '@/components/agency/Panel';
import { badgeClass, dateTime, shortDate } from '@/lib/format';
import { Presentation, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

export default async function AgencyPitchLivePage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const proposals = await prisma.proposal.findMany({
    where: { status: { in: ['sent', 'approved', 'rejected'] } },
    include: { org: true, changeRequests: { orderBy: { createdAt: 'desc' } }, payments: true },
    orderBy: { updatedAt: 'desc' },
  });

  const openRequests = proposals.reduce((n, p) => n + p.changeRequests.filter((c) => c.status === 'pending').length, 0);
  const awaiting = proposals.filter((p) => p.status === 'sent').length;
  const approved = proposals.filter((p) => p.status === 'approved').length;

  return (
    <>
      <PageHeader title="Pitch live" desc="Pitches out in the world and the feedback coming back in real time" pendingCount={openRequests} />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Live Pitches', value: String(proposals.length), icon: Presentation },
            { label: 'Awaiting Decision', value: String(awaiting), icon: Clock },
            { label: 'Approved', value: String(approved), icon: CheckCircle2 },
            { label: 'Open Change Asks', value: String(openRequests), icon: MessageSquare },
          ]}
        />
        <div className="px-[26px] pt-[18px] space-y-4">
          {proposals.length === 0 ? (
            <Panel><EmptyState>No pitches are live right now.</EmptyState></Panel>
          ) : (
            proposals.map((p) => (
              <Panel key={p.id}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[15px] font-semibold tracking-[-0.015em] text-[#14141a]">{p.title}</span>
                      <span className={badgeClass(p.status)}>{p.status}</span>
                    </div>
                    <div className="text-[12.5px] text-[#5f5f66] mt-1">
                      {p.org.name} · sent {shortDate(p.createdAt)} · {p.payments.filter((x) => x.status === 'paid').length} payment(s) collected
                    </div>
                  </div>
                  <Link href={`/pitch/${p.token}`} className="text-[12.5px] font-medium text-[#146c43] hover:text-[#0f5132] flex-shrink-0">
                    Open pitch room →
                  </Link>
                </div>
                {p.changeRequests.length > 0 && (
                  <div className="border-t border-[#efede7] bg-[#faf9f6] divide-y divide-[#efede7]">
                    {p.changeRequests.map((c) => (
                      <div key={c.id} className="flex items-start gap-3 px-5 py-2.5">
                        <span className="mono text-[10.5px] uppercase tracking-[0.1em] text-[#5c5a52] w-[80px] flex-shrink-0 pt-0.5">
                          {c.page}
                        </span>
                        <p className="flex-1 text-[12.5px] text-[#14141a]">{c.request}</p>
                        <span className={`${badgeClass(c.status)} flex-shrink-0`}>{c.status}</span>
                        <span className="mono text-[11px] text-[#918da0] flex-shrink-0">{dateTime(c.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            ))
          )}
        </div>
      </div>
    </>
  );
}
