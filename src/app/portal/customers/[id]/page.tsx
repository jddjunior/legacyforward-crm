import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.orgId) return null;

  const customer = await prisma.customer.findFirst({ where: { id: params.id, orgId: session.orgId } });
  if (!customer) return <div className="p-8 text-[#6b6b74]">Customer not found.</div>;

  const deals = await prisma.deal.findMany({ where: { orgId: session.orgId } });
  const customerDeals = deals.filter(d => d.title.includes(customer.name.split(' ')[0]));

  return (
    <>
      <PageHeader title={customer.name} desc={`Customer since ${customer.createdAt.toLocaleDateString()}`} pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px] max-w-3xl">
        <Link href="/portal/customers" className="text-[12.5px] text-[#6b6b74] hover:text-[#146c43] flex items-center gap-1 mb-4">
          <ArrowLeft size={14} /> Back to Customers
        </Link>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#f7f6f2] flex items-center justify-center text-[14px] font-bold text-[#5c5a52]">
            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="text-[28px] font-semibold tracking-[-0.03em] text-[#14141a]">{customer.name}</div>
            <div className="flex items-center gap-4 text-[13px] text-[#5f5f66] mt-1">
              {customer.email && <span className="flex items-center gap-1"><Mail size={14} /> {customer.email}</span>}
              {customer.phone && <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>}
            </div>
            {customer.address && <div className="flex items-center gap-1 text-[13px] text-[#5f5f66] mt-1"><MapPin size={14} /> {customer.address}</div>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#e9e6de] rounded-[13px] p-5">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-3">Customer Value</h2>
            <div className="stat text-[#14141a]">{customer.value ? `$${(customer.value / 100).toLocaleString()}` : '—'}</div>
            <div className="text-[12px] text-[#5f5f66] mt-1">Customer since {customer.createdAt.toLocaleDateString()}</div>
          </div>

          <div className="bg-white border border-[#e9e6de] rounded-[13px] p-5">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-3">Related Deals</h2>
            {customerDeals.length === 0 ? (
              <p className="text-[13px] text-[#6b6b74]">No deals linked to this customer.</p>
            ) : (
              <div className="space-y-2">
                {customerDeals.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-[#14141a]">{d.title}</span>
                    <span className="mono text-[#5f5f66]">${(d.value / 100).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
