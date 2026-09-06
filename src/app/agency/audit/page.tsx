import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import Panel, { EmptyState } from '@/components/agency/Panel';
import { dateTime, humanize, initials } from '@/lib/format';

export default async function AgencyAuditPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const logs = await prisma.auditLog.findMany({
    include: { org: true, user: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <>
      <PageHeader title="Audit log" desc="Every action taken across every client account" />
      <div className="flex-1 min-w-0 px-[26px] pb-[26px]">
        <Panel title={`Last ${logs.length} event${logs.length === 1 ? '' : 's'}`}>
          {logs.length === 0 ? (
            <EmptyState>No activity recorded yet.</EmptyState>
          ) : (
            <div className="divide-y divide-[#efede7]">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3.5 px-5 py-3 hover:bg-[#f7f6f2] transition-colors">
                  <span className="w-8 h-8 rounded-full bg-[#f7f6f2] flex items-center justify-center text-[10.5px] font-bold text-[#5c5a52] flex-shrink-0">
                    {initials(log.user?.name || log.user?.email || 'System')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#14141a]">
                      <span className="font-semibold">{log.user?.name || log.user?.email || 'System'}</span>
                      <span className="text-[#5f5f66]"> {humanize(log.action)} </span>
                      <span className="font-medium">{humanize(log.entity)}</span>
                      {log.entityId && <span className="mono text-[11.5px] text-[#918da0]"> #{log.entityId.slice(-6)}</span>}
                    </div>
                    <div className="text-[12px] text-[#5f5f66] mt-0.5">{log.org.name}</div>
                  </div>
                  <span className="mono text-[11px] text-[#918da0] flex-shrink-0">{dateTime(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
