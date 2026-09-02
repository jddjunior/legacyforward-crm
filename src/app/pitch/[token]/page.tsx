import { prisma } from '@/lib/db';
import PitchClient from '@/components/PitchClient';

export default async function PitchPage({ params }: { params: { token: string } }) {
  const proposal = await prisma.proposal.findUnique({
    where: { token: params.token },
    include: { org: true },
  });

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-surface">
        <div className="card p-10 text-center max-w-md">
          <h1 className="text-xl font-semibold mb-2">Proposal not found</h1>
          <p className="text-ink-muted text-sm">This proposal link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  const pages = (proposal.pages as any[]) || [{ name: 'Home', sections: [] }];
  const stripeEnabled = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder';

  return (
    <PitchClient
      proposalId={proposal.id}
      pages={pages}
      title={proposal.title}
      stripeEnabled={!!stripeEnabled}
    />
  );
}
