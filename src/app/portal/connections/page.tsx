import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Check, Clock, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

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
    <>
      <PageHeader title="Connections" desc="Every platform your stack reads from and writes to" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px]">
        <div className="grid grid-cols-2 gap-4">
          {connections.map((c) => {
            const Icon = c.status === 'connected' ? Check : c.status === 'error' ? AlertCircle : Clock;
            const colorBg = c.status === 'connected' ? '#e8f3ec' : c.status === 'error' ? '#fee2e2' : '#f7f6f2';
            const colorText = c.status === 'connected' ? '#146c43' : c.status === 'error' ? '#b02a12' : '#5f5f66';
            return (
              <div key={c.id} className="bg-white border border-[#e9e6de] rounded-[13px] p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: colorBg }}>
                  <Icon size={18} style={{ color: colorText }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-[#14141a]">{providerLabels[c.provider] || c.provider}</div>
                  <div className="text-[12.5px] text-[#5f5f66] capitalize mt-0.5">{c.status}</div>
                </div>
                <span className={`badge ${c.status === 'connected' ? 'badge-green' : c.status === 'error' ? 'badge-red' : 'badge-gray'}`}>
                  {c.status === 'connected' ? 'Active' : c.status === 'error' ? 'Error' : 'Pending'}
                </span>
              </div>
            );
          })}
          {connections.length === 0 && (
            <div className="col-span-2 bg-white border border-[#e9e6de] rounded-[13px] px-5 py-16 text-center text-[13px] text-[#6b6b74]">No connections configured.</div>
          )}
        </div>
      </div>
    </>
  );
}
