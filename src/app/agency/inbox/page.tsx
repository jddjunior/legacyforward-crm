import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import Panel, { EmptyState } from '@/components/agency/Panel';
import StatGrid from '@/components/agency/StatGrid';
import { badgeClass, humanize, dateTime, initials } from '@/lib/format';
import { Inbox, PhoneMissed, Star, UserPlus } from 'lucide-react';

type Message = {
  id: string;
  from: string;
  client: string;
  channel: string;
  preview: string;
  status: string;
  at: Date;
};

export default async function AgencyInboxPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [leads, missedCalls, reviews] = await Promise.all([
    prisma.lead.findMany({ include: { org: true }, orderBy: { createdAt: 'desc' }, take: 40 }),
    prisma.callRecord.findMany({ where: { status: 'missed' }, include: { org: true }, orderBy: { startedAt: 'desc' }, take: 20 }),
    prisma.review.findMany({ where: { status: 'pending' }, include: { org: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);

  const messages: Message[] = [
    ...leads.map((l) => ({
      id: `l-${l.id}`, from: l.name, client: l.org.name,
      channel: l.source ?? 'form', preview: l.notes ?? l.email ?? l.phone ?? 'New inbound lead',
      status: l.status, at: l.createdAt,
    })),
    ...missedCalls.map((c) => ({
      id: `c-${c.id}`, from: c.callerName, client: c.org.name, channel: 'missed call',
      preview: c.summary ?? `Missed call from ${c.phone ?? 'unknown number'}`, status: 'missed', at: c.startedAt,
    })),
    ...reviews.map((r) => ({
      id: `r-${r.id}`, from: r.author, client: r.org.name, channel: r.source,
      preview: r.content ?? `${r.rating}-star review`, status: r.status, at: r.createdAt,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <>
      <PageHeader title="Inbox" desc="Inbound leads, missed calls, and reviews across every client" pendingCount={missedCalls.length} />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Unified Items', value: String(messages.length), icon: Inbox },
            { label: 'New Leads', value: String(leads.filter((l) => l.status === 'new').length), icon: UserPlus },
            { label: 'Missed Calls', value: String(missedCalls.length), icon: PhoneMissed },
            { label: 'Reviews To Vet', value: String(reviews.length), icon: Star },
          ]}
        />
        <div className="px-[26px] pt-[18px]">
          <Panel title="All conversations">
            {messages.length === 0 ? (
              <EmptyState>Inbox is empty.</EmptyState>
            ) : (
              <div className="divide-y divide-[#efede7]">
                {messages.map((m) => (
                  <div key={m.id} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-[#f7f6f2] transition-colors">
                    <span className="w-9 h-9 rounded-full bg-[#f7f6f2] flex items-center justify-center text-[11px] font-bold text-[#5c5a52] flex-shrink-0">
                      {initials(m.from)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-[#14141a]">{m.from}</span>
                        <span className="text-[12px] text-[#918da0]">{m.client}</span>
                        <span className="mono text-[10.5px] uppercase tracking-[0.1em] text-[#5c5a52]">{humanize(m.channel)}</span>
                      </div>
                      <p className="text-[12.5px] text-[#5f5f66] mt-1 line-clamp-2">{m.preview}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={badgeClass(m.status)}>{humanize(m.status)}</span>
                      <span className="mono text-[11px] text-[#918da0]">{dateTime(m.at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
