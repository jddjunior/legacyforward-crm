import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createLead, deleteLead } from '@/app/actions/leads';

export default async function LeadsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const leads = await prisma.lead.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-display">Leads</h1>
          <p className="text-ink-muted text-sm mt-1">{leads.length} total</p>
        </div>
      </div>

      {/* New lead form */}
      <details className="card mb-6">
        <summary className="px-5 py-3.5 cursor-pointer text-sm font-semibold select-none">+ New Lead</summary>
        <form action={createLead} className="p-5 pt-2 grid grid-cols-3 gap-3">
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
        <div className="card p-12 text-center text-ink-muted">No leads yet. Create your first lead above.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left">
                <th className="px-5 py-3 label">Name</th>
                <th className="px-5 py-3 label">Email</th>
                <th className="px-5 py-3 label">Phone</th>
                <th className="px-5 py-3 label">Source</th>
                <th className="px-5 py-3 label">Status</th>
                <th className="px-5 py-3 label">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-ink-surface">
                  <td className="px-5 py-3 font-medium">
                    <a href={`/portal/leads/${lead.id}`} className="hover:text-brand">{lead.name}</a>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{lead.email || '—'}</td>
                  <td className="px-5 py-3 text-ink-muted">{lead.phone || '—'}</td>
                  <td className="px-5 py-3 text-ink-muted capitalize">{lead.source || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${lead.status === 'qualified' ? 'badge-green' : lead.status === 'lost' ? 'badge-red' : lead.status === 'contacted' ? 'badge-blue' : 'badge-gray'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{lead.createdAt.toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <form action={() => deleteLead(lead.id)}>
                      <button type="submit" className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
