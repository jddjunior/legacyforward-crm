import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import ProposalBuilder from '@/components/ProposalBuilder';

export default async function NewProposalPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const clients = await prisma.org.findMany({
    where: { isAgency: false },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-display mb-2">New Proposal</h1>
      <p className="text-ink-muted text-sm mb-8">Create a website pitch for a client. They'll receive a signed link to preview, request changes, and pay.</p>
      <ProposalBuilder clientOrgs={clients} />
    </div>
  );
}
