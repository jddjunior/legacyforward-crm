import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { saveBrand, linkConnections, completeOnboarding } from '@/app/actions/onboarding';
import { Check, Upload, Link2, Star, Rocket } from 'lucide-react';

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
    <div className="p-8 max-w-2xl">
      <h1 className="text-display mb-2">Welcome to LegacyForward</h1>
      <p className="text-ink-muted text-sm mb-8">Let's get your account set up. This takes about 5 minutes.</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = i < currentStepIndex || isComplete;
          const current = i === currentStepIndex && !isComplete;
          return (
            <div key={step.stage} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? 'bg-green-100 text-green-600' : current ? 'bg-brand text-white' : 'bg-ink-surface text-ink-subtle'
              }`}>
                {done ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className={`text-xs font-medium ${current ? 'text-ink' : 'text-ink-subtle'}`}>{step.label}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${done ? 'bg-green-200' : 'bg-ink-line'}`} />}
            </div>
          );
        })}
      </div>

      {isComplete ? (
        <div className="card p-8 text-center">
          <Rocket size={40} className="mx-auto text-green-600 mb-4" />
          <h2 className="text-lg font-semibold mb-2">You're all set!</h2>
          <p className="text-ink-muted text-sm mb-6">Your account is active. The full CRM is now unlocked.</p>
          <a href="/portal" className="btn btn-primary">Go to Dashboard</a>
        </div>
      ) : currentStepIndex === 0 ? (
        /* Step 1: Brand Setup */
        <div className="card p-6">
          <h2 className="text-sm font-semibold mb-1">Brand Setup</h2>
          <p className="text-xs text-ink-muted mb-5">Upload your logo and set your brand color.</p>
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
                <input name="brandColor" type="color" defaultValue={org.brandColor || '#335aea'} className="w-12 h-10 rounded-lg border border-ink-line" />
                <input name="brandColorText" className="input flex-1" defaultValue={org.brandColor || '#335aea'} placeholder="#335aea" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center">Continue →</button>
          </form>
        </div>
      ) : currentStepIndex === 1 ? (
        /* Step 2: Connect Integrations */
        <div className="card p-6">
          <h2 className="text-sm font-semibold mb-1">Connect Integrations</h2>
          <p className="text-xs text-ink-muted mb-5">Link your marketing accounts. You can skip and add these later.</p>
          <form action={linkConnections} className="space-y-3">
            {['google_ads', 'meta', 'callrail', 'google_analytics', 'google_search_console'].map((p) => (
              <label key={p} className="flex items-center gap-3 p-3 border border-ink-line rounded-lg cursor-pointer hover:bg-ink-surface">
                <input type="checkbox" name="providers" value={p} className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">{p.replace(/_/g, ' ')}</span>
              </label>
            ))}
            <button type="submit" className="btn btn-primary w-full justify-center">Continue →</button>
          </form>
        </div>
      ) : currentStepIndex === 2 ? (
        /* Step 3: Review Settings */
        <div className="card p-6">
          <h2 className="text-sm font-semibold mb-1">Review Settings</h2>
          <p className="text-xs text-ink-muted mb-5">Confirm your setup looks good, then launch.</p>
          <form action={completeOnboarding} className="space-y-4">
            <div className="p-4 bg-ink-surface rounded-lg">
              <div className="label mb-1">Organization</div>
              <div className="text-sm font-medium">{org.name}</div>
              <div className="label mt-3 mb-1">Brand Color</div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded" style={{ background: org.brandColor || '#335aea' }} />
                <span className="text-sm font-mono">{org.brandColor || '#335aea'}</span>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center">
              <Rocket size={16} /> Launch Account
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
