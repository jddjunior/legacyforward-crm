import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createDeal } from '@/app/actions/deals';
import PipelineBoard from '@/components/PipelineBoard';

export default async function PipelinePage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const deals = await prisma.deal.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-display">Pipeline</h1>
          <p className="text-ink-muted text-sm mt-1">Drag deals between stages.</p>
        </div>
      </div>

      <details className="card mb-6">
        <summary className="px-5 py-3.5 cursor-pointer text-sm font-semibold select-none">+ New Deal</summary>
        <form action={createDeal} className="p-5 pt-2 grid grid-cols-3 gap-3">
          <div>
            <label className="label block mb-1.5">Title *</label>
            <input name="title" required className="input" placeholder="Kitchen remodel — J. Smith" />
          </div>
          <div>
            <label className="label block mb-1.5">Value (USD) *</label>
            <input name="value" type="number" required className="input" placeholder="15000" />
          </div>
          <div>
            <label className="label block mb-1.5">Stage</label>
            <select name="stage" className="input" defaultValue="lead">
              <option value="lead">Lead</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
            </select>
          </div>
          <div className="col-span-3 flex justify-end">
            <button type="submit" className="btn btn-primary">Create Deal</button>
          </div>
        </form>
      </details>

      <PipelineBoard deals={deals} />
    </div>
  );
}
