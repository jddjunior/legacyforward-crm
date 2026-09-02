import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createCustomer, deleteCustomer } from '@/app/actions/customers';
import PageHeader from '@/components/PageHeader';

export default async function CustomersPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const customers = await prisma.customer.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader title="Customers" desc={`${customers.length} total`} pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px]">
        <details className="bg-white border border-[#e9e6de] rounded-[13px] mb-4 overflow-hidden">
          <summary className="px-5 py-3.5 cursor-pointer text-[13.5px] font-semibold select-none hover:bg-[#f7f6f2]">+ New Customer</summary>
          <form action={createCustomer} className="p-5 pt-2 grid grid-cols-3 gap-3 border-t border-[#efede7]">
            <div>
              <label className="label block mb-1.5">Name *</label>
              <input name="name" required className="input" placeholder="Acme Co." />
            </div>
            <div>
              <label className="label block mb-1.5">Email</label>
              <input name="email" type="email" className="input" placeholder="billing@acme.com" />
            </div>
            <div>
              <label className="label block mb-1.5">Phone</label>
              <input name="phone" className="input" placeholder="(555) 123-4567" />
            </div>
            <div className="col-span-2">
              <label className="label block mb-1.5">Address</label>
              <input name="address" className="input" placeholder="123 Main St, City, ST 00000" />
            </div>
            <div>
              <label className="label block mb-1.5">Value (USD)</label>
              <input name="value" type="number" className="input" placeholder="5000" />
            </div>
            <div className="col-span-3 flex justify-end">
              <button type="submit" className="btn btn-primary">Create Customer</button>
            </div>
          </form>
        </details>

        {customers.length === 0 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] px-5 py-16 text-center text-[13px] text-[#6b6b74]">No customers yet.</div>
        ) : (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#efede7] text-left">
                  <th className="px-5 py-3 label">Name</th>
                  <th className="px-5 py-3 label">Email</th>
                  <th className="px-5 py-3 label">Phone</th>
                  <th className="px-5 py-3 label">Value</th>
                  <th className="px-5 py-3 label">Since</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede7]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f7f6f2] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#14141a]">
                      <a href={`/portal/customers/${c.id}`} className="hover:text-[#146c43]">{c.name}</a>
                    </td>
                    <td className="px-5 py-3 text-[#5f5f66]">{c.email || '—'}</td>
                    <td className="px-5 py-3 text-[#5f5f66]">{c.phone || '—'}</td>
                    <td className="px-5 py-3 mono">{c.value ? `$${(c.value / 100).toLocaleString()}` : '—'}</td>
                    <td className="px-5 py-3 text-[#5f5f66] mono text-[12.5px]">{c.createdAt.toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <form action={() => deleteCustomer(c.id)}>
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
