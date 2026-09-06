import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import StatGrid from '@/components/agency/StatGrid';
import Panel from '@/components/agency/Panel';
import DataTable from '@/components/agency/DataTable';
import { badgeClass, dateTime, duration, humanize } from '@/lib/format';
import { Bot, PhoneCall, FileStack, Smile } from 'lucide-react';

export default async function AgencyAgentPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [calls, documents] = await Promise.all([
    prisma.callRecord.findMany({ include: { org: true }, orderBy: { startedAt: 'desc' }, take: 50 }),
    prisma.document.findMany({ include: { org: true }, orderBy: { updatedAt: 'desc' }, take: 50 }),
  ]);

  const handled = calls.filter((c) => c.status !== 'missed');
  const warming = calls.filter((c) => c.sentiment === 'Warming').length;
  const indexed = documents.filter((d) => d.status === 'indexed').length;
  const avgDuration = handled.length
    ? duration(Math.round(handled.reduce((n, c) => n + c.durationSec, 0) / handled.length))
    : '0:00';

  return (
    <>
      <PageHeader title="AI agent" desc="What the call copilot handled and the knowledge it is working from" />
      <div className="flex-1 min-w-0 pb-[26px]">
        <StatGrid
          stats={[
            { label: 'Calls Handled', value: String(handled.length), icon: PhoneCall },
            { label: 'Avg Call Length', value: avgDuration, icon: Bot },
            { label: 'Warming Leads', value: String(warming), icon: Smile },
            { label: 'Docs Indexed', value: `${indexed}/${documents.length}`, icon: FileStack },
          ]}
        />
        <div className="px-[26px] pt-[18px] grid gap-4 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
          <Panel title="Recent calls">
            <DataTable
              rows={calls}
              empty="No calls recorded yet."
              columns={[
                { header: 'Caller', cell: (c) => c.callerName, className: 'font-medium text-[#14141a]' },
                { header: 'Client', cell: (c) => c.org.name },
                { header: 'Length', cell: (c) => <span className="mono text-[12.5px]">{duration(c.durationSec)}</span> },
                { header: 'Sentiment', cell: (c) => (c.sentiment ? <span className={badgeClass(c.sentiment)}>{c.sentiment}</span> : '—') },
                { header: 'Status', cell: (c) => <span className={badgeClass(c.status)}>{humanize(c.status)}</span> },
                { header: 'When', cell: (c) => <span className="mono text-[12px]">{dateTime(c.startedAt)}</span> },
              ]}
            />
          </Panel>
          <Panel title="Knowledge base">
            <DataTable
              rows={documents}
              empty="No documents uploaded yet."
              columns={[
                { header: 'Document', cell: (d) => d.title, className: 'font-medium text-[#14141a]' },
                { header: 'Client', cell: (d) => d.org.name },
                { header: 'Type', cell: (d) => <span className="mono text-[12px] uppercase">{d.category}</span> },
                { header: 'Size', cell: (d) => <span className="mono text-[12px]">{d.size ?? '—'}</span> },
                { header: 'Status', cell: (d) => <span className={badgeClass(d.status)}>{humanize(d.status)}</span> },
              ]}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
