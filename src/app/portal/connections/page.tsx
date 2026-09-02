import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Check, Clock, AlertCircle } from 'lucide-react';

const providerLabels: Record<string, string> = {
  google_ads: 'Google Ads',
  meta: 'Meta (Facebook/Instagram)',
  callrail: 'CallRail',
  stripe: 'Stripe',
  google_analytics: 'Google Analytics',
  google_search_console: 'Google Search Console',
};

export default async function ConnectionsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const connections = await prisma.connection.findMany({
    where: { orgId: session.orgId },
  });

  return (
    <div className="p-8">
      <h1 className="text-display mb-6">Connections</h1>
      <div className="grid grid-cols-2 gap-4">
        {connections.map((c) => {
          const Icon = c.status === 'connected' ? Check : c.status === 'error' ? AlertCircle : Clock;
          return (
            <div key={c.id} className="card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${c.status === 'connected' ? 'bg-green-50 text-green-600' : c.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-ink-surface text-ink-muted'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{providerLabels[c.provider] || c.provider}</div>
                <div className="text-xs text-ink-muted capitalize">{c.status}</div>
              </div>
            </div>
          );
        })}
        {connections.length === 0 && (
          <div className="card p-12 text-center text-ink-muted col-span-2">No connections configured.</div>
        )}
      </div>
    </div>
  );
}
