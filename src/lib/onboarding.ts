// Onboarding stage machine (Build Plan Phase 1).
// Shared by the portal layout, the pitch backdrop, the payment webhooks and
// the server-side CRM gate.

export const ONBOARDING_ORDER = [
  'proposal_sent', 'proposal_approved', 'payment_complete', 'account_created',
  'brand_uploaded', 'connections_linked', 'reviews_approved', 'active',
] as const;

export type OnboardingStage = (typeof ONBOARDING_ORDER)[number];

/** The stage at which the CRM becomes real rather than a dimmed preview. */
export const ACTIVE_STAGE: OnboardingStage = 'active';

export function isStage(value: string): value is OnboardingStage {
  return (ONBOARDING_ORDER as readonly string[]).includes(value);
}

export function stageIndex(stage: string) {
  return ONBOARDING_ORDER.indexOf(stage as OnboardingStage);
}

/**
 * Stages advance one step at a time and never run backwards — a replayed
 * webhook must not drag an active account back to `payment_complete`.
 * Re-asserting the current stage is allowed (idempotent no-op).
 */
export function canTransition(from: string, to: string) {
  if (!isStage(from) || !isStage(to)) return false;
  if (from === to) return true;
  return stageIndex(to) === stageIndex(from) + 1;
}

export function assertTransition(from: string, to: string) {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal onboarding transition: ${from} → ${to}`);
  }
}

/**
 * Advances to `to` only when that is the legal next step, and never backwards.
 * Returns the stage the org should now be on. Webhooks use this so an
 * out-of-order or replayed delivery settles on the furthest legitimate stage.
 */
export function nextStage(current: string, to: string): OnboardingStage {
  if (!isStage(current) || !isStage(to)) return current as OnboardingStage;
  return stageIndex(to) > stageIndex(current) ? to : (current as OnboardingStage);
}
