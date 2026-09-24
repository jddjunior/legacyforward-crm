import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createService, toggleService, deleteService } from '@/app/actions/services';
import { PageHeader, NewItemPanel, Field, Empty, ActionButton } from '@/components/ui';
import { money } from '@/lib/format';

export default async function ServicesPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const services = await prisma.service.findMany({
    where: { orgId: session.orgId },
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
  });
  const mrr = services.filter((s) => s.active).reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="p-8">
      <PageHeader title="Services" subtitle={`${services.filter((s) => s.active).length} active · ${money(mrr)}/mo`} />

      <NewItemPanel label="New Service">
        <form action={createService} className="grid grid-cols-4 gap-3">
          <Field label="Name *"><input name="name" required className="input" placeholder="Local SEO" /></Field>
          <Field label="Description" className="col-span-3"><input name="description" className="input" /></Field>
          <Field label="Price / month ($) *"><input name="price" type="number" min="0" step="0.01" required className="input" /></Field>
          <Field label="Cost / month ($)"><input name="cost" type="number" min="0" step="0.01" className="input" /></Field>
          <div className="col-span-2 flex items-end justify-end"><button type="submit" className="btn btn-primary">Create Service</button></div>
        </form>
      </NewItemPanel>

      {services.length === 0 ? (
        <Empty>No services yet.</Empty>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left">
                <th className="px-5 py-3 label">Service</th>
                <th className="px-5 py-3 label">Price</th>
                <th className="px-5 py-3 label">Cost</th>
                <th className="px-5 py-3 label">Margin</th>
                <th className="px-5 py-3 label">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {services.map((s) => {
                const margin = s.price ? Math.round(((s.price - (s.cost || 0)) / s.price) * 100) : 0;
                return (
                  <tr key={s.id} className={`hover:bg-ink-surface ${s.active ? '' : 'opacity-60'}`}>
                    <td className="px-5 py-3">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-ink-muted">{s.description}</div>
                    </td>
                    <td className="px-5 py-3">{money(s.price)}</td>
                    <td className="px-5 py-3 text-ink-muted">{money(s.cost)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${margin > 60 ? 'badge-green' : margin > 40 ? 'badge-yellow' : 'badge-red'}`}>{margin}%</span>
                    </td>
                    <td className="px-5 py-3">
                      <ActionButton action={toggleService.bind(null, s.id)} tone="link">{s.active ? 'Active — deactivate' : 'Inactive — activate'}</ActionButton>
                    </td>
                    <td className="px-5 py-3 text-right"><ActionButton action={deleteService.bind(null, s.id)} tone="danger">Delete</ActionButton></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
