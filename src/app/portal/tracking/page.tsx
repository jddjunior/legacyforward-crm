import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';

export default async function TrackingPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const leads = await prisma.lead.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const sources = leads.reduce((acc, l) => {
    const s = l.source || 'organic';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader title="Lead Tracking" desc="Every inbound lead by source, channel, and stage" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px] bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
        {/* Source summary */}
        <div className="flex gap-2.5 p-5 border-b border-[#efede7] flex-wrap">
          {Object.entries(sources).map(([src, count]) => (
            <span key={src} className="inline-flex items-center gap-2 h-8 px-3 rounded-full border border-[#e2ded4] bg-white text-[12.5px] font-medium text-[#3f3f47]">
              <span className="capitalize">{src}</span>
              <span className="mono text-[11px] font-semibold bg-[#f2efe8] text-[#5c5a52] rounded-full px-1.5 py-0.5">{count}</span>
            </span>
          ))}
        </div>

        {leads.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-[#6b6b74]">No leads tracked yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#efede7] text-left">
                <th className="px-5 py-3 label">Name</th>
                <th className="px-5 py-3 label">Source</th>
                <th className="px-5 py-3 label">Status</th>
                <th className="px-5 py-3 label">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efede7]">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#f7f6f2] transition-colors">
                  <td className="px-5 py-3 font-medium text-[#14141a]">
                    <a href={`/portal/leads/${lead.id}`} className="hover:text-[#146c43]">{lead.name}</a>
                    {(lead.email || lead.phone) && <span className="text-[#5f5f66] font-normal"> · {lead.email || lead.phone}</span>}
                  </td>
                  <td className="px-5 py-3 capitalize text-[#5f5f66]">{lead.source || 'organic'}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${lead.status === 'qualified' ? 'badge-green' : lead.status === 'lost' ? 'badge-red' : 'badge-gray'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#5f5f66] mono text-[12.5px]">{lead.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
