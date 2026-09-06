import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { forSession } from '@/lib/rls';
import { ACTIVE_STAGE } from '@/lib/onboarding';
import type { SessionPayload } from '@/lib/session';

/**
 * Server-side onboarding gate (Build Plan Phase 1 security gate).
 *
 * The dimmed CRM behind the pitch is cosmetic. This is the real boundary: no
 * CRM data is served until the org reaches `active`, regardless of what the
 * frontend chooses to render. Onboarding, profile, settings and connections
 * stay reachable so an org can actually finish setup.
 */
export async function requireActiveOrg(session?: SessionPayload) {
  const s = session ?? (await requireSession());
  if (!s.orgId) throw new Error('Unauthorized: no org context');

  const db = forSession(s);
  const org = await db.org.findUnique({ where: { id: s.orgId } });
  if (!org) throw new Error('Unauthorized: org not found');

  // Agency staff operate accounts that are still onboarding.
  const isAgency = s.orgRole === 'agency_admin' || s.orgRole === 'agency_manager';
  if (!isAgency && org.onboardingStage !== ACTIVE_STAGE) {
    throw new OnboardingIncompleteError(org.onboardingStage);
  }

  return { session: s, db, org };
}

/** Page variant: sends an onboarding org back to the wizard instead of erroring. */
export async function requireActiveOrgPage() {
  try {
    return await requireActiveOrg();
  } catch (err) {
    if (err instanceof OnboardingIncompleteError) redirect('/portal/onboarding');
    throw err;
  }
}

export class OnboardingIncompleteError extends Error {
  constructor(public stage: string) {
    super(`CRM is unavailable until onboarding completes (current stage: ${stage})`);
    this.name = 'OnboardingIncompleteError';
  }
}
