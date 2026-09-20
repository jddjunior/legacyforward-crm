import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateProposal, resolveChangeRequest } from '@/app/actions/proposals';

const STATUSES = ['draft', 'sent', 'approved', 'rejected'];

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.orgId) return null;

  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
    include: {
      org: true,
      changeRequests: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!proposal) notFound();

  const pitchPath = `/pitch/${proposal.token}`;

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/agency/proposals" className="text-xs text-ink-muted">← Proposals</Link>
      <h1 className="text-display mt-2 mb-1">{proposal.title}</h1>
      <p className="text-sm text-ink-muted mb-6">
        {proposal.org.name} · created {proposal.createdAt.toLocaleDateString()}
      </p>

      <form action={updateProposal.bind(null, proposal.id)} className="card p-5 grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="label block mb-1.5">Title</label>
          <input name="title" defaultValue={proposal.title} required className="input" />
        </div>
        <div>
          <label className="label block mb-1.5">Status</label>
          <select name="status" defaultValue={proposal.status} className="input">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label block mb-1.5">Live site URL</label>
          <input name="liveUrl" type="url" defaultValue={proposal.liveUrl ?? ''} className="input" placeholder="https://staging.client.com" />
        </div>
        <div>
          <label className="label block mb-1.5">Project price (USD)</label>
          <input name="price" inputMode="decimal" defaultValue={proposal.priceCents != null ? proposal.priceCents / 100 : ''} className="input" />
        </div>
        <div className="col-span-2 flex items-center justify-between">
          <div className="text-xs text-ink-muted">
            Pitch room: <Link href={pitchPath} className="text-brand font-mono">{pitchPath}</Link>
          </div>
          <button type="submit" className="btn btn-primary">Save changes</button>
        </div>
      </form>

      <section className="card p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">Change requests</h2>
        {proposal.changeRequests.length === 0 ? (
          <p className="text-xs text-ink-muted">No change requests from the client yet.</p>
        ) : (
          <div className="grid gap-2">
            {proposal.changeRequests.map((cr) => (
              <div key={cr.id} className="flex items-center gap-3 border border-ink-line rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-ink-subtle">{cr.page}</div>
                  <div className="text-sm">{cr.request}</div>
                </div>
                <span className={`badge ${cr.status === 'resolved' ? 'badge-green' : 'badge-gray'}`}>{cr.status}</span>
                {cr.status !== 'resolved' && (
                  <form action={resolveChangeRequest.bind(null, proposal.id, cr.id)}>
                    <button type="submit" className="btn btn-ghost text-xs h-8">Mark resolved</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-3">Payments</h2>
        {proposal.payments.length === 0 ? (
          <p className="text-xs text-ink-muted">No payments recorded for this proposal.</p>
        ) : (
          <div className="grid gap-2">
            {proposal.payments.map((pay) => (
              <div key={pay.id} className="flex items-center justify-between text-sm border border-ink-line rounded-lg p-3">
                <span>${(pay.amount / 100).toLocaleString('en-US')}</span>
                <span className="badge badge-gray">{pay.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
