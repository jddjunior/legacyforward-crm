import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function AgencyProposalsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const proposals = await prisma.proposal.findMany({
    include: { org: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <h1 className="text-display mb-6">Proposals</h1>
      {proposals.length === 0 ? (
        <div className="card p-12 text-center text-ink-muted">
          No proposals yet. Proposals are created when you pitch a website build to a client.
        </div>
      ) : (
        <div className="grid gap-3">
          {proposals.map((p) => (
            <div key={p.id} className="card p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{p.title}</div>
                <div className="text-xs text-ink-muted mt-0.5">{p.org.name} · {p.createdAt.toLocaleDateString()}</div>
              </div>
              <span className={`badge ${p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>
                {p.status}
              </span>
              <Link href={`/pitch/${p.token}`} className="text-xs text-brand">Open pitch link →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
