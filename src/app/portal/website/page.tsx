import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ExternalLink } from 'lucide-react';
import { createSiteRequest, setSiteRequestStatus, deleteSiteRequest, updateWebsiteUrl } from '@/app/actions/site-requests';
import { PageHeader, NewItemPanel, Field, Empty, StatusBadge, ActionButton } from '@/components/ui';
import { shortDate } from '@/lib/format';

const NEXT_STATUS: Record<string, { to: string; label: string }> = {
  open: { to: 'in_progress', label: 'Start' },
  in_progress: { to: 'done', label: 'Mark done' },
  done: { to: 'open', label: 'Reopen' },
};

export default async function WebsitePage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [org, requests, proposal] = await Promise.all([
    prisma.org.findUnique({ where: { id: session.orgId } }),
    prisma.siteRequest.findMany({ where: { orgId: session.orgId }, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }] }),
    prisma.proposal.findFirst({ where: { orgId: session.orgId, liveUrl: { not: null } }, orderBy: { updatedAt: 'desc' } }),
  ]);
  const siteUrl = org?.website || proposal?.liveUrl || null;
  const open = requests.filter((r) => r.status !== 'done').length;

  return (
    <div className="p-8">
      <PageHeader title="Website" subtitle="Your live site and the change requests our team is working on.">
        {siteUrl && (
          <a href={siteUrl} target="_blank" rel="noreferrer" className="btn text-sm">
            <ExternalLink size={14} /> Visit site
          </a>
        )}
      </PageHeader>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 flex flex-col gap-3">
          <form action={updateWebsiteUrl} className="card p-4 flex items-end gap-3">
            <Field label="Site URL" className="flex-1">
              <input name="website" type="url" defaultValue={org?.website || ''} placeholder={proposal?.liveUrl || 'https://yourbusiness.com'} className="input" />
            </Field>
            <button type="submit" className="btn h-10">Save</button>
          </form>
          <div className="card overflow-hidden h-[560px] bg-ink-surface">
            {siteUrl ? (
              <iframe src={siteUrl} title="Live website" className="w-full h-full bg-white" />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-ink-muted">Add your site URL to preview it here.</div>
            )}
          </div>
          <p className="text-xs text-ink-muted">Some sites block previews inside other apps — use “Visit site” if it stays blank.</p>
        </div>

        <div className="col-span-2">
          <h2 className="text-sm font-semibold mb-3">Change requests <span className="text-ink-muted font-normal">· {open} open</span></h2>
          <NewItemPanel label="Request a change">
            <form action={createSiteRequest} className="grid grid-cols-2 gap-3">
              <Field label="Page *"><input name="page" required className="input" placeholder="Home" /></Field>
              <Field label="Priority">
                <select name="priority" className="input" defaultValue="normal">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <Field label="What should change? *" className="col-span-2">
                <textarea name="request" required rows={3} className="input h-auto py-2" />
              </Field>
              <div className="col-span-2 flex justify-end"><button type="submit" className="btn btn-primary">Submit</button></div>
            </form>
          </NewItemPanel>

          {requests.length === 0 ? (
            <Empty>No change requests yet.</Empty>
          ) : (
            <div className="grid gap-3">
              {requests.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium">{r.page}</span>
                    <StatusBadge status={r.status} />
                    {r.priority === 'high' && <StatusBadge status="high" />}
                    <span className="text-xs text-ink-muted ml-auto">{shortDate(r.createdAt)}</span>
                  </div>
                  <p className={`text-sm mb-3 ${r.status === 'done' ? 'text-ink-muted line-through' : ''}`}>{r.request}</p>
                  <div className="flex items-center gap-2">
                    <ActionButton action={setSiteRequestStatus.bind(null, r.id, NEXT_STATUS[r.status]?.to || 'open')}>
                      {NEXT_STATUS[r.status]?.label || 'Reopen'}
                    </ActionButton>
                    <div className="ml-auto"><ActionButton action={deleteSiteRequest.bind(null, r.id)} tone="danger">Delete</ActionButton></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
