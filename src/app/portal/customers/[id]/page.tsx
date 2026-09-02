import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, DollarSign } from 'lucide-react';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.orgId) return null;

  const customer = await prisma.customer.findFirst({ where: { id: params.id, orgId: session.orgId } });
  if (!customer) return <div className="p-8 text-ink-muted">Customer not found.</div>;

  const deals = await prisma.deal.findMany({
    where: { orgId: session.orgId },
  });
  const customerDeals = deals.filter(d => d.title.includes(customer.name.split(' ')[0]));

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/portal/customers" className="text-xs text-ink-muted hover:text-brand flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> Back to Customers
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-ink-surface flex items-center justify-center text-sm font-bold">
          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1">
          <h1 className="text-display">{customer.name}</h1>
          <div className="flex items-center gap-4 text-sm text-ink-muted mt-1">
            {customer.email && <span className="flex items-center gap-1"><Mail size={14} /> {customer.email}</span>}
            {customer.phone && <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>}
          </div>
          {customer.address && <div className="flex items-center gap-1 text-sm text-ink-muted mt-1"><MapPin size={14} /> {customer.address}</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-3">Customer Value</h2>
          <div className="stat">{customer.value ? `$${(customer.value / 100).toLocaleString()}` : '—'}</div>
          <div className="text-xs text-ink-muted mt-1">Customer since {customer.createdAt.toLocaleDateString()}</div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-3">Related Deals</h2>
          {customerDeals.length === 0 ? (
            <p className="text-sm text-ink-muted">No deals linked to this customer.</p>
          ) : (
            <div className="space-y-2">
              {customerDeals.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{d.title}</span>
                  <span className="text-ink-muted">${(d.value / 100).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
