import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { humanize, initials, shortDate } from '@/lib/format';

const STAGES = [
  'proposal_sent',
  'proposal_approved',
  'payment_complete',
  'account_created',
  'brand_uploaded',
  'connections_linked',
  'reviews_approved',
  'active',
];

export default async function AgencyOnboardingPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const clients = await prisma.org.findMany({ where: { isAgency: false }, orderBy: { createdAt: 'asc' } });
  const done = clients.filter((c) => c.onboardingStage === 'active').length;

  return (
    <>
      <PageHeader title="Onboarding" desc={`${done} of ${clients.length} accounts fully live`} />
      <div className="flex-1 min-w-0 px-[26px] pb-[26px]">
        <div className="flex gap-3.5 overflow-x-auto pb-2">
          {STAGES.map((stage) => {
            const inStage = clients.filter((c) => c.onboardingStage === stage);
            return (
              <div key={stage} className="w-[240px] flex-shrink-0 bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#efede7] flex items-center gap-2">
                  <span className="mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#5c5a52]">{humanize(stage)}</span>
                  <span className="ml-auto mono text-[11px] font-semibold text-[#14141a]">{inStage.length}</span>
                </div>
                <div className="p-2.5 space-y-2 min-h-[90px]">
                  {inStage.map((c) => (
                    <Link
                      key={c.id}
                      href="/agency/clients"
                      className="block rounded-[9px] border border-[#eeece6] bg-[#faf9f6] px-3 py-2.5 hover:border-[#146c43] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-white border border-[#eeece6] flex items-center justify-center text-[10px] font-bold text-[#5c5a52]">
                          {initials(c.name)}
                        </span>
                        <span className="text-[12.5px] font-semibold text-[#14141a] truncate">{c.name}</span>
                      </span>
                      <span className="block mono text-[10.5px] text-[#918da0] mt-1.5">started {shortDate(c.createdAt)}</span>
                    </Link>
                  ))}
                  {inStage.length === 0 && (
                    <div className="text-center text-[11.5px] text-[#b4b0bd] py-5">empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
