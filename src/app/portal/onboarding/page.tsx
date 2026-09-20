import { Rocket } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ONBOARDING_STEPS, stepIndexForStage } from '@/lib/onboarding';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import KickoffStep from '@/components/onboarding/KickoffStep';
import BrandStep from '@/components/onboarding/BrandStep';
import IntegrationsStep from '@/components/onboarding/IntegrationsStep';
import ReviewStep from '@/components/onboarding/ReviewStep';

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const org = await prisma.org.findUnique({
    where: { id: session.orgId },
    include: { connections: true },
  });
  if (!org) return null;

  const isComplete = org.onboardingStage === 'active';
  const stepIndex = stepIndexForStage(org.onboardingStage);
  // Stages before approval (proposal_sent) have no step yet — start them at kickoff.
  const currentStepIndex = isComplete ? ONBOARDING_STEPS.length : stepIndex === -1 ? 0 : stepIndex;
  const connected = org.connections.filter((c) => c.status === 'connected').map((c) => c.provider);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-display mb-2">Welcome to Branch Avenue</h1>
      <p className="text-ink-muted text-sm mb-8">
        Let&apos;s get your account set up. This takes about 5 minutes.
      </p>

      <OnboardingProgress currentStepIndex={currentStepIndex} isComplete={isComplete} />

      {isComplete ? (
        <div className="card p-8 text-center">
          <Rocket size={40} className="mx-auto text-green-600 mb-4" />
          <h2 className="text-lg font-semibold mb-2">You&apos;re all set!</h2>
          <p className="text-ink-muted text-sm mb-6">Your account is active. The full CRM is now unlocked.</p>
          <a href="/portal" className="btn btn-primary">Go to Dashboard</a>
        </div>
      ) : currentStepIndex === 0 ? (
        <KickoffStep org={org} />
      ) : currentStepIndex === 1 ? (
        <BrandStep org={org} />
      ) : currentStepIndex === 2 ? (
        <IntegrationsStep connected={connected} />
      ) : (
        <ReviewStep org={org} connected={connected} />
      )}
    </div>
  );
}
