/**
 * Client onboarding flow: the sequence a client walks after approving a proposal.
 * Each step lists the org.onboardingStage values that mean "you are on this step".
 */
export const ONBOARDING_STEPS = [
  { id: 'kickoff', label: 'Kickoff Details', stages: ['proposal_approved', 'payment_complete', 'account_created'] },
  { id: 'brand', label: 'Brand Setup', stages: ['kickoff_complete'] },
  { id: 'integrations', label: 'Connect Integrations', stages: ['brand_uploaded'] },
  { id: 'review', label: 'Review & Launch', stages: ['connections_linked', 'reviews_approved'] },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id'];

/** Index of the step a stage sits on; -1 when onboarding has not started or is done. */
export function stepIndexForStage(stage: string) {
  return ONBOARDING_STEPS.findIndex((s) => (s.stages as readonly string[]).includes(stage));
}
