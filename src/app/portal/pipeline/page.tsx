import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createDeal } from '@/app/actions/deals';
import PipelineBoard from '@/components/PipelineBoard';
import PageHeader from '@/components/PageHeader';

export default async function PipelinePage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const deals = await prisma.deal.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader title="Pipeline" desc="Drag deals between stages." pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px]">
        <details className="bg-white border border-[#e9e6de] rounded-[13px] mb-4 overflow-hidden">
          <summary className="px-5 py-3.5 cursor-pointer text-[13.5px] font-semibold select-none hover:bg-[#f7f6f2]">+ New Deal</summary>
          <form action={createDeal} className="p-5 pt-2 grid grid-cols-3 gap-3 border-t border-[#efede7]">
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
    </>
  );
}
