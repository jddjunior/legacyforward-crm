import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { saveBrand, linkConnections, completeOnboarding } from '@/app/actions/onboarding';
import { Check, Upload, Link2, Star, Rocket } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const STEPS = [
  { stage: 'payment_complete', label: 'Brand Setup', icon: Upload },
  { stage: 'brand_uploaded', label: 'Connect Integrations', icon: Link2 },
  { stage: 'connections_linked', label: 'Review Settings', icon: Star },
  { stage: 'active', label: 'Launch', icon: Rocket },
];

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const org = await prisma.org.findUnique({ where: { id: session.orgId } });
  if (!org) return null;

  const currentStepIndex = STEPS.findIndex(s => s.stage === org.onboardingStage);
  const isComplete = org.onboardingStage === 'active';

  return (
    <>
      <PageHeader title="Setup record" desc="What you completed to open the portal" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px] max-w-2xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < currentStepIndex || isComplete;
            const current = i === currentStepIndex && !isComplete;
            return (
              <div key={step.stage} className="flex items-center gap-2 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    background: done ? '#e8f3ec' : current ? '#14141a' : '#f7f6f2',
                    color: done ? '#146c43' : current ? '#fff' : '#918da0',
                  }}
                >
                  {done ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-[12px] font-medium ${current ? 'text-[#14141a]' : 'text-[#918da0]'}`}>{step.label}</span>
                {i < STEPS.length - 1 && <div className={`h-px flex-1 ${done ? 'bg-[#9bc4a9]' : 'bg-[#e9e6de]'}`} />}
              </div>
            );
          })}
        </div>

        {isComplete ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] p-8 text-center">
            <span className="inline-flex w-14 h-14 rounded-full bg-[#e8f3ec] items-center justify-center mb-4">
              <Rocket size={28} strokeWidth={1.5} className="text-[#146c43]" />
            </span>
            <h2 className="text-[17px] font-semibold tracking-[-0.015em] mb-2">You're all set!</h2>
            <p className="text-[13px] text-[#6b6b74] mb-6">Your account is active. The full CRM is now unlocked.</p>
            <a href="/portal" className="btn btn-primary">Go to Dashboard</a>
          </div>
        ) : currentStepIndex === 0 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] p-6">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-1">Brand Setup</h2>
            <p className="text-[12px] text-[#6b6b74] mb-5">Upload your logo and set your brand color.</p>
            <form action={saveBrand} className="space-y-4">
              <div>
                <label className="label block mb-1.5">Organization Name</label>
                <input name="name" defaultValue={org.name} className="input" />
              </div>
              <div>
                <label className="label block mb-1.5">Logo URL</label>
                <input name="logoUrl" className="input" placeholder="https://…" />
              </div>
              <div>
                <label className="label block mb-1.5">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input name="brandColor" type="color" defaultValue={org.brandColor || '#146c43'} className="w-12 h-10 rounded-lg border border-[#e9e6de]" />
                  <input name="brandColorText" className="input flex-1" defaultValue={org.brandColor || '#146c43'} placeholder="#146c43" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full justify-center">Continue →</button>
            </form>
          </div>
        ) : currentStepIndex === 1 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] p-6">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-1">Connect Integrations</h2>
            <p className="text-[12px] text-[#6b6b74] mb-5">Link your marketing accounts. You can skip and add these later.</p>
            <form action={linkConnections} className="space-y-3">
              {['google_ads', 'meta', 'callrail', 'google_analytics', 'google_search_console'].map((p) => (
                <label key={p} className="flex items-center gap-3 p-3 border border-[#e9e6de] rounded-[13px] cursor-pointer hover:bg-[#f7f6f2] transition-colors">
                  <input type="checkbox" name="providers" value={p} className="w-4 h-4 accent-[#146c43]" />
                  <span className="text-[13.5px] font-medium capitalize text-[#14141a]">{p.replace(/_/g, ' ')}</span>
                </label>
              ))}
              <button type="submit" className="btn btn-primary w-full justify-center">Continue →</button>
            </form>
          </div>
        ) : currentStepIndex === 2 ? (
          <div className="bg-white border border-[#e9e6de] rounded-[13px] p-6">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-1">Review Settings</h2>
            <p className="text-[12px] text-[#6b6b74] mb-5">Confirm your setup looks good, then launch.</p>
            <form action={completeOnboarding} className="space-y-4">
              <div className="p-4 bg-[#f7f6f2] rounded-[13px]">
                <div className="label mb-1">Organization</div>
                <div className="text-[14px] font-medium text-[#14141a]">{org.name}</div>
                <div className="label mt-3 mb-1">Brand Color</div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded" style={{ background: org.brandColor || '#146c43' }} />
                  <span className="text-[13px] mono text-[#14141a]">{org.brandColor || '#146c43'}</span>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full justify-center">
                <Rocket size={16} /> Launch Account
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </>
  );
}
