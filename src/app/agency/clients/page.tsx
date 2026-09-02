import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function AgencyClientsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const clients = await prisma.org.findMany({
    where: { isAgency: false },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <h1 className="text-display mb-6">Clients</h1>
      {clients.length === 0 ? (
        <div className="card p-12 text-center text-ink-muted">No clients yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left">
                <th className="px-5 py-3 label">Name</th>
                <th className="px-5 py-3 label">Onboarding</th>
                <th className="px-5 py-3 label">Stripe</th>
                <th className="px-5 py-3 label">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-ink-surface">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${c.onboardingStage === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                      {c.onboardingStage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{c.stripeCustomerId ? 'Yes' : '—'}</td>
                  <td className="px-5 py-3 text-ink-muted">{c.createdAt.toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <Link href="/agency/proposals" className="text-xs text-brand">Send Proposal</Link>
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
