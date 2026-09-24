import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { DollarSign, MousePointerClick, Users, Target } from 'lucide-react';
import { createCampaign, setCampaignStatus, updateCampaignStats, deleteCampaign } from '@/app/actions/campaigns';
import { PageHeader, NewItemPanel, Field, Empty, StatCard, StatusBadge, ActionButton } from '@/components/ui';
import { money, shortDate } from '@/lib/format';

const PLATFORMS: Record<string, string> = { google_ads: 'Google Ads', meta: 'Meta Ads' };

export default async function AdsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const campaigns = await prisma.campaign.findMany({
    where: { orgId: session.orgId },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  const live = campaigns.filter((c) => c.status === 'active');
  const spend = campaigns.reduce((s, c) => s + c.spendCents, 0);
  const leads = campaigns.reduce((s, c) => s + c.leads, 0);
  const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);

  return (
    <div className="p-8">
      <PageHeader title="Ads" subtitle="Google Ads and Meta campaigns with budget and spend tracking." />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Active campaigns" value={String(live.length)} icon={Target} />
        <StatCard label="Total spend" value={money(spend)} icon={DollarSign} />
        <StatCard label="Clicks" value={clicks.toLocaleString()} icon={MousePointerClick} />
        <StatCard label="Cost per lead" value={leads ? money(Math.round(spend / leads)) : '—'} icon={Users} hint={`${leads} leads`} />
      </div>

      <NewItemPanel label="New Campaign">
        <form action={createCampaign} className="grid grid-cols-5 gap-3">
          <Field label="Name *" className="col-span-2"><input name="name" required className="input" placeholder="Spring tune-up — Search" /></Field>
          <Field label="Platform">
            <select name="platform" className="input">
              {Object.entries(PLATFORMS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Monthly budget ($)"><input name="budget" type="number" min="0" step="1" required className="input" placeholder="1500" /></Field>
          <div />
          <Field label="Start"><input name="startDate" type="date" className="input" /></Field>
          <Field label="End"><input name="endDate" type="date" className="input" /></Field>
          <div className="col-span-3 flex items-end justify-end">
            <button type="submit" className="btn btn-primary">Create Campaign</button>
          </div>
        </form>
      </NewItemPanel>

      {campaigns.length === 0 ? (
        <Empty>No campaigns yet. Create your first one above.</Empty>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c) => {
            const pct = c.budgetCents ? Math.min(100, Math.round((c.spendCents / c.budgetCents) * 100)) : 0;
            return (
              <div key={c.id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="badge badge-gray">{PLATFORMS[c.platform] || c.platform}</span>
                  <span className="font-medium text-sm">{c.name}</span>
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-ink-muted ml-auto">{shortDate(c.startDate)} → {shortDate(c.endDate)}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-2 rounded-full bg-ink-surface overflow-hidden">
                    <div className={`h-full ${pct >= 95 ? 'bg-red-500' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-ink-muted w-44 text-right">{money(c.spendCents)} of {money(c.budgetCents)} ({pct}%)</span>
                </div>

                <div className="flex items-end gap-3 flex-wrap">
                  <form action={updateCampaignStats.bind(null, c.id)} className="flex items-end gap-2">
                    <Field label="Spend ($)"><input name="spend" type="number" min="0" step="0.01" defaultValue={c.spendCents / 100} className="input w-28" /></Field>
                    <Field label="Clicks"><input name="clicks" type="number" min="0" defaultValue={c.clicks} className="input w-24" /></Field>
                    <Field label="Leads"><input name="leads" type="number" min="0" defaultValue={c.leads} className="input w-20" /></Field>
                    <button type="submit" className="btn text-xs h-9 px-3">Update</button>
                  </form>
                  <div className="ml-auto flex items-center gap-2">
                    {c.status !== 'active' && c.status !== 'ended' && (
                      <ActionButton action={setCampaignStatus.bind(null, c.id, 'active')} tone="primary">Launch</ActionButton>
                    )}
                    {c.status === 'active' && <ActionButton action={setCampaignStatus.bind(null, c.id, 'paused')}>Pause</ActionButton>}
                    {c.status !== 'ended' && <ActionButton action={setCampaignStatus.bind(null, c.id, 'ended')}>End</ActionButton>}
                    <ActionButton action={deleteCampaign.bind(null, c.id)} tone="danger">Delete</ActionButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
