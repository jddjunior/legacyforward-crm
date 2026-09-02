import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default async function AgencyClientsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const clients = await prisma.org.findMany({
    where: { isAgency: false },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader title="Clients" desc="Every account, its health, and how much work it owes you" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px]">
        {clients.length === 0 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] px-5 py-16 text-center text-[13px] text-[#6b6b74]">No clients yet.</div>
        ) : (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#efede7] text-left">
                  <th className="px-5 py-3 label">Name</th>
                  <th className="px-5 py-3 label">Onboarding</th>
                  <th className="px-5 py-3 label">Stripe</th>
                  <th className="px-5 py-3 label">Created</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede7]">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f7f6f2] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#14141a]">{c.name}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${c.onboardingStage === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                        {c.onboardingStage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#5f5f66]">{c.stripeCustomerId ? 'Yes' : '—'}</td>
                    <td className="px-5 py-3 text-[#5f5f66] mono text-[12.5px]">{c.createdAt.toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <Link href="/agency/proposals" className="text-[12.5px] font-medium text-[#146c43] hover:text-[#0f5132]">Send Proposal</Link>
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
