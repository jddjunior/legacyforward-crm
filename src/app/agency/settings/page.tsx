import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/agency/Panel';
import DataTable from '@/components/agency/DataTable';
import { badgeClass, humanize, initials, shortDate } from '@/lib/format';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-5 py-3.5 flex items-center gap-4">
      <span className="mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#5c5a52] w-[150px] flex-shrink-0">{label}</span>
      <span className="text-[13.5px] text-[#14141a] min-w-0">{value}</span>
    </div>
  );
}

export default async function AgencySettingsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [agency, admins, integrations] = await Promise.all([
    prisma.org.findUnique({ where: { id: session.orgId } }),
    prisma.membership.findMany({
      where: { orgId: session.orgId, role: 'agency_admin' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.connection.findMany({ where: { orgId: session.orgId }, orderBy: { provider: 'asc' } }),
  ]);

  if (!agency) return null;

  return (
    <>
      <PageHeader title="Settings" desc="How this agency workspace is configured" />
      <div className="flex-1 min-w-0 px-[26px] pb-[26px] grid gap-4 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
        <Panel title="Workspace">
          <div className="divide-y divide-[#efede7]">
            <Field label="Agency name" value={agency.name} />
            <Field label="Slug" value={<span className="mono text-[12.5px]">{agency.slug ?? '—'}</span>} />
            <Field
              label="Brand color"
              value={
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border border-[#e6e2d8]" style={{ background: agency.brandColor ?? '#14141a' }} />
                  <span className="mono text-[12.5px]">{agency.brandColor ?? 'default'}</span>
                </span>
              }
            />
            <Field label="WorkOS org" value={<span className="mono text-[12.5px]">{agency.workosOrgId ?? 'not linked'}</span>} />
            <Field label="Stripe customer" value={<span className="mono text-[12.5px]">{agency.stripeCustomerId ?? 'not linked'}</span>} />
            <Field label="Created" value={<span className="mono text-[12.5px]">{shortDate(agency.createdAt)}</span>} />
          </div>
        </Panel>

        <Panel title="Signed in as">
          <div className="divide-y divide-[#efede7]">
            <Field label="Name" value={session.name || '—'} />
            <Field label="Email" value={<span className="mono text-[12.5px]">{session.email}</span>} />
            <Field label="Role" value={<span className={badgeClass(session.orgRole ?? 'agency_admin')}>{humanize(session.orgRole ?? 'agency_admin')}</span>} />
          </div>
        </Panel>

        <Panel title="Agency admins">
          <DataTable
            rows={admins}
            empty="No admins found."
            columns={[
              {
                header: 'Person',
                className: 'font-medium text-[#14141a]',
                cell: (m) => (
                  <span className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-[#f7f6f2] flex items-center justify-center text-[11px] font-bold text-[#5c5a52]">
                      {initials(m.user.name || m.user.email)}
                    </span>
                    <span>{m.user.name || m.user.email.split('@')[0]}</span>
                  </span>
                ),
              },
              { header: 'Email', cell: (m) => <span className="mono text-[12.5px]">{m.user.email}</span> },
              { header: 'Since', cell: (m) => <span className="mono text-[12.5px]">{shortDate(m.createdAt)}</span> },
            ]}
          />
        </Panel>

        <Panel title="Agency integrations">
          <DataTable
            rows={integrations}
            empty="No integrations linked to the agency workspace."
            columns={[
              { header: 'Provider', cell: (c) => humanize(c.provider), className: 'font-medium text-[#14141a]' },
              { header: 'Status', cell: (c) => <span className={badgeClass(c.status)}>{humanize(c.status)}</span> },
              { header: 'Linked', cell: (c) => <span className="mono text-[12.5px]">{shortDate(c.createdAt)}</span> },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
