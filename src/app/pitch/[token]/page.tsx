import { prisma } from '@/lib/db';
import PitchClient from '@/components/PitchClient';
import PortalBackdrop from '@/components/pitch/PortalBackdrop';

export default async function PitchPage({ params }: { params: { token: string } }) {
  const proposal = await prisma.proposal.findUnique({
    where: { token: params.token },
    include: { org: { include: { reviews: true } } },
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
  const stagedLabel = proposal.updatedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const reviews = proposal.org.reviews.map((r) => ({
    id: r.id,
    author: r.author,
    platform: r.source,
    rating: r.rating,
    text: r.content || '',
  }));

  return (
    <PitchClient
      proposalId={proposal.id}
      orgName={proposal.org.name}
      stagedLabel={stagedLabel}
      pages={pages}
      stripeEnabled={!!stripeEnabled}
      reviews={reviews}
    >
      <PortalBackdrop orgId={proposal.orgId} />
    </PitchClient>
  );
}
