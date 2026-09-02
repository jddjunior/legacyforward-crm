import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createCustomer, deleteCustomer } from '@/app/actions/customers';

export default async function CustomersPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const customers = await prisma.customer.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-display">Customers</h1>
        <p className="text-ink-muted text-sm mt-1">{customers.length} total</p>
      </div>

      <details className="card mb-6">
        <summary className="px-5 py-3.5 cursor-pointer text-sm font-semibold select-none">+ New Customer</summary>
        <form action={createCustomer} className="p-5 pt-2 grid grid-cols-3 gap-3">
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
        <div className="card p-12 text-center text-ink-muted">No customers yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left">
                <th className="px-5 py-3 label">Name</th>
                <th className="px-5 py-3 label">Email</th>
                <th className="px-5 py-3 label">Phone</th>
                <th className="px-5 py-3 label">Value</th>
                <th className="px-5 py-3 label">Since</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-ink-surface">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-ink-muted">{c.email || '—'}</td>
                  <td className="px-5 py-3 text-ink-muted">{c.phone || '—'}</td>
                  <td className="px-5 py-3">{c.value ? `$${(c.value / 100).toLocaleString()}` : '—'}</td>
                  <td className="px-5 py-3 text-ink-muted">{c.createdAt.toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <form action={() => deleteCustomer(c.id)}>
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
