import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createLead, deleteLead } from '@/app/actions/leads';
import PageHeader from '@/components/PageHeader';

export default async function LeadsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const leads = await prisma.lead.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader title="Leads" desc={`${leads.length} total`} pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px]">
        {/* New lead form */}
        <details className="bg-white border border-[#e9e6de] rounded-[13px] mb-4 overflow-hidden">
          <summary className="px-5 py-3.5 cursor-pointer text-[13.5px] font-semibold select-none hover:bg-[#f7f6f2]">+ New Lead</summary>
          <form action={createLead} className="p-5 pt-2 grid grid-cols-3 gap-3 border-t border-[#efede7]">
            <div>
              <label className="label block mb-1.5">Name *</label>
              <input name="name" required className="input" placeholder="John Smith" />
            </div>
            <div>
              <label className="label block mb-1.5">Email</label>
              <input name="email" type="email" className="input" placeholder="john@example.com" />
            </div>
            <div>
              <label className="label block mb-1.5">Phone</label>
              <input name="phone" className="input" placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="label block mb-1.5">Source</label>
              <select name="source" className="input">
                <option value="">—</option>
                <option value="call">Call</option>
                <option value="form">Form</option>
                <option value="referral">Referral</option>
                <option value="organic">Organic</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label block mb-1.5">Notes</label>
              <input name="notes" className="input" placeholder="Additional context…" />
            </div>
            <div className="col-span-3 flex justify-end">
              <button type="submit" className="btn btn-primary">Create Lead</button>
            </div>
          </form>
        </details>

        {/* Table */}
        {leads.length === 0 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] px-5 py-16 text-center text-[13px] text-[#6b6b74]">No leads yet. Create your first lead above.</div>
        ) : (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#efede7] text-left">
                  <th className="px-5 py-3 label">Name</th>
                  <th className="px-5 py-3 label">Email</th>
                  <th className="px-5 py-3 label">Phone</th>
                  <th className="px-5 py-3 label">Source</th>
                  <th className="px-5 py-3 label">Status</th>
                  <th className="px-5 py-3 label">Created</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede7]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#f7f6f2] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#14141a]">
                      <a href={`/portal/leads/${lead.id}`} className="hover:text-[#146c43]">{lead.name}</a>
                    </td>
                    <td className="px-5 py-3 text-[#5f5f66]">{lead.email || '—'}</td>
                    <td className="px-5 py-3 text-[#5f5f66]">{lead.phone || '—'}</td>
                    <td className="px-5 py-3 text-[#5f5f66] capitalize">{lead.source || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${lead.status === 'qualified' ? 'badge-green' : lead.status === 'lost' ? 'badge-red' : lead.status === 'contacted' ? 'badge-blue' : 'badge-gray'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#5f5f66] mono text-[12.5px]">{lead.createdAt.toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <form action={() => deleteLead(lead.id)}>
                        <button type="submit" className="text-xs text-[#b02a12] hover:text-[#cf1c0c]">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
