import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { updateLeadStatus } from '@/app/actions/leads';
import { addLeadNote } from '@/app/actions/lead-detail';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.orgId) return null;

  const lead = await prisma.lead.findFirst({ where: { id: params.id, orgId: session.orgId } });
  if (!lead) return <div className="p-8 text-ink-muted">Lead not found.</div>;

  const statuses = ['new', 'contacted', 'qualified', 'lost'];

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/portal/leads" className="text-xs text-ink-muted hover:text-brand flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> Back to Leads
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-ink-surface flex items-center justify-center text-sm font-bold">
          {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1">
          <h1 className="text-display">{lead.name}</h1>
          <div className="flex items-center gap-4 text-sm text-ink-muted mt-1">
            {lead.email && <span className="flex items-center gap-1"><Mail size={14} /> {lead.email}</span>}
            {lead.phone && <span className="flex items-center gap-1"><Phone size={14} /> {lead.phone}</span>}
            <span className="capitalize">Source: {lead.source || 'organic'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Status</h2>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <form key={s} action={() => updateLeadStatus(lead.id, s)}>
                <button
                  type="submit"
                  className={`badge cursor-pointer ${lead.status === s ? (s === 'qualified' ? 'badge-green' : s === 'lost' ? 'badge-red' : s === 'contacted' ? 'badge-blue' : 'badge-gray') : 'badge-gray opacity-50 hover:opacity-100'}`}
                >
                  {s}
                </button>
              </form>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-ink-line text-xs text-ink-muted">
            Created {lead.createdAt.toLocaleDateString()} at {lead.createdAt.toLocaleTimeString()}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Add Note</h2>
          <form action={addLeadNote.bind(null, lead.id)} className="space-y-3">
            <textarea name="note" className="input" rows={4} placeholder="Add a note about this lead…" />
            <button type="submit" className="btn btn-primary text-xs h-8 px-3">Save Note</button>
          </form>
        </div>
      </div>

      {lead.notes && (
        <div className="card p-5 mt-4">
          <h2 className="text-sm font-semibold mb-3">Notes</h2>
          <div className="text-sm text-ink-muted whitespace-pre-wrap">{lead.notes}</div>
        </div>
      )}
    </div>
  );
}
