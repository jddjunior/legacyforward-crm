import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';

export default async function ServicesPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const services = await prisma.service.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader title="Services" desc="Catalog, pricing, margin floor" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px]">
        {services.length === 0 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] px-5 py-16 text-center text-[13px] text-[#6b6b74]">No services yet.</div>
        ) : (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#efede7] text-left">
                  <th className="px-5 py-3 label">Service</th>
                  <th className="px-5 py-3 label">Price</th>
                  <th className="px-5 py-3 label">Cost</th>
                  <th className="px-5 py-3 label">Margin</th>
                  <th className="px-5 py-3 label">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede7]">
                {services.map((s) => {
                  const margin = s.cost ? Math.round(((s.price - s.cost) / s.price) * 100) : 100;
                  return (
                    <tr key={s.id} className="hover:bg-[#f7f6f2] transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-[#14141a]">{s.name}</div>
                        <div className="text-xs text-[#5f5f66] mt-0.5">{s.description}</div>
                      </td>
                      <td className="px-5 py-3 mono">${(s.price / 100).toLocaleString()}</td>
                      <td className="px-5 py-3 text-[#5f5f66] mono">{s.cost ? `$${(s.cost / 100).toLocaleString()}` : '—'}</td>
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
    </>
  );
}
