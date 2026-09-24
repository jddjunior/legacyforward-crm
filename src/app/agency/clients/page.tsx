import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { createClient, setClientStage } from '@/app/actions/clients';
import { switchOrg } from '@/app/actions/session';
import { PageHeader, NewItemPanel, Field, Empty, StatusBadge, ActionButton } from '@/components/ui';
import { label, money, shortDate } from '@/lib/format';

const STAGES = [
  'proposal_sent', 'proposal_approved', 'payment_complete', 'account_created',
  'kickoff_complete', 'brand_uploaded', 'connections_linked', 'reviews_approved', 'active',
];

export default async function AgencyClientsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const clients = await prisma.org.findMany({
    where: { isAgency: false },
    orderBy: { createdAt: 'desc' },
    include: {
      memberships: { where: { userId: session.userId }, select: { id: true } },
      payments: { where: { status: 'paid' }, select: { amount: true } },
      _count: { select: { leads: true, approvals: { where: { status: 'pending' } } } },
    },
  });

  return (
    <div className="p-8">
      <PageHeader title="Clients" subtitle={`${clients.length} clients · ${clients.filter((c) => c.onboardingStage === 'active').length} live`} />

      <NewItemPanel label="New Client">
        <form action={createClient} className="grid grid-cols-4 gap-3">
          <Field label="Business name *"><input name="name" required className="input" placeholder="Summit Electric" /></Field>
          <Field label="Website"><input name="website" type="url" className="input" placeholder="https://" /></Field>
          <Field label="Contact name"><input name="contactName" className="input" /></Field>
          <Field label="Owner login email"><input name="ownerEmail" type="email" className="input" placeholder="owner@business.com" /></Field>
          <div className="col-span-4 flex justify-end"><button type="submit" className="btn btn-primary">Create Client</button></div>
        </form>
      </NewItemPanel>

      {clients.length === 0 ? (
        <Empty>No clients yet.</Empty>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left">
                <th className="px-5 py-3 label">Name</th>
                <th className="px-5 py-3 label">Onboarding stage</th>
                <th className="px-5 py-3 label">Leads</th>
                <th className="px-5 py-3 label">Pending approvals</th>
                <th className="px-5 py-3 label">Paid</th>
                <th className="px-5 py-3 label">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-ink-surface">
                  <td className="px-5 py-3">
                    <div className="font-medium">{c.name}</div>
                    {c.website && <div className="text-xs text-ink-muted">{c.website}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <form action={setClientStage.bind(null, c.id)} className="flex items-center gap-2">
                      <StatusBadge status={c.onboardingStage === 'active' ? 'active' : 'pending'} />
                      <select name="stage" defaultValue={c.onboardingStage} className="input h-8 text-xs w-44 capitalize">
                        {STAGES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                      </select>
                      <button type="submit" className="btn text-xs h-8 px-2">Set</button>
                    </form>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{c._count.leads}</td>
                  <td className="px-5 py-3 text-ink-muted">{c._count.approvals}</td>
                  <td className="px-5 py-3 text-ink-muted">{money(c.payments.reduce((s, p) => s + p.amount, 0))}</td>
                  <td className="px-5 py-3 text-ink-muted">{shortDate(c.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                      <Link href={`/agency/proposals/new?orgId=${c.id}`} className="text-xs text-brand">Send proposal</Link>
                      {c.memberships.length > 0 && (
                        <ActionButton action={switchOrg.bind(null, c.id, '/portal')} tone="link">Open portal →</ActionButton>
                      )}
                    </div>
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
