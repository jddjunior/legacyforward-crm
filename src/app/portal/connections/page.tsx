import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Check, Clock, AlertCircle, Plug } from 'lucide-react';
import { connectProvider, disconnectProvider } from '@/app/actions/connections';
import { PageHeader, ActionButton } from '@/components/ui';

const PROVIDERS: { id: string; name: string; hint: string }[] = [
  { id: 'google_ads', name: 'Google Ads', hint: 'Customer ID, e.g. 123-456-7890' },
  { id: 'meta', name: 'Meta (Facebook/Instagram)', hint: 'Business Manager ID' },
  { id: 'callrail', name: 'CallRail', hint: 'Account number' },
  { id: 'google_analytics', name: 'Google Analytics', hint: 'Measurement ID, e.g. G-XXXXXXX' },
  { id: 'google_search_console', name: 'Google Search Console', hint: 'Property URL' },
  { id: 'google_business', name: 'Google Business Profile', hint: 'Location ID' },
  { id: 'stripe', name: 'Stripe', hint: 'Account ID, e.g. acct_…' },
];

export default async function ConnectionsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const connections = await prisma.connection.findMany({ where: { orgId: session.orgId } });
  const byProvider = new Map(connections.map((c) => [c.provider, c]));

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Connections"
        subtitle={`${connections.filter((c) => c.status === 'connected').length} of ${PROVIDERS.length} accounts linked — we use these to pull reporting and manage campaigns.`}
      />
      <div className="grid grid-cols-2 gap-4">
        {PROVIDERS.map((p) => {
          const c = byProvider.get(p.id);
          const status = c?.status || 'not_connected';
          const Icon = status === 'connected' ? Check : status === 'error' ? AlertCircle : status === 'pending' ? Clock : Plug;
          const accountId = (c?.metadata as { accountId?: string } | null)?.accountId;
          return (
            <div key={p.id} className="card p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${status === 'connected' ? 'bg-green-50 text-green-600' : status === 'error' ? 'bg-red-50 text-red-600' : 'bg-ink-surface text-ink-muted'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-ink-muted capitalize">{status.replace(/_/g, ' ')}{accountId ? ` · ${accountId}` : ''}</div>
                </div>
                {c && <ActionButton action={disconnectProvider.bind(null, p.id)} tone="danger">Disconnect</ActionButton>}
              </div>
              {status !== 'connected' && (
                <form action={connectProvider.bind(null, p.id)} className="flex gap-2">
                  <input name="accountId" required className="input h-9 flex-1" placeholder={p.hint} />
                  <button type="submit" className="btn btn-primary text-xs h-9 px-3">Connect</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
