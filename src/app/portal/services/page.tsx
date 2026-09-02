import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function ServicesPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const services = await prisma.service.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <h1 className="text-display mb-6">Services</h1>
      {services.length === 0 ? (
        <div className="card p-12 text-center text-ink-muted">No services yet.</div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {services.map((s) => {
                const margin = s.cost ? Math.round(((s.price - s.cost) / s.price) * 100) : 100;
                return (
                  <tr key={s.id} className="hover:bg-ink-surface">
                    <td className="px-5 py-3">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-ink-muted">{s.description}</div>
                    </td>
                    <td className="px-5 py-3">${(s.price / 100).toLocaleString()}</td>
                    <td className="px-5 py-3 text-ink-muted">{s.cost ? `$${(s.cost / 100).toLocaleString()}` : '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${margin > 60 ? 'badge-green' : margin > 40 ? 'badge-yellow' : 'badge-red'}`}>{margin}%</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${s.active ? 'badge-green' : 'badge-gray'}`}>{s.active ? 'active' : 'inactive'}</span>
                    </td>
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
