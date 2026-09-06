/**
 * Phase 1 gate: payment idempotency, the onboarding stage machine, the
 * server-side CRM gate and deal stage history.
 *
 * Run: npm run test:phase1
 */
import { PrismaClient } from '@prisma/client';
import { forOrg } from '../src/lib/rls';
import { withIdempotency } from '../src/lib/idempotency';
import { canTransition, nextStage } from '../src/lib/onboarding';
import { requireActiveOrg, OnboardingIncompleteError } from '../src/lib/gate';
import type { SessionPayload } from '../src/lib/session';

const admin = new PrismaClient();

let passed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function main() {
  const suffix = Date.now();

  console.log('\nWebhook idempotency (§1.9):');

  let runs = 0;
  const eventId = `evt_test_${suffix}`;
  const first = await withIdempotency({ source: 'stripe', eventId }, async () => { runs += 1; return 'ok'; });
  const second = await withIdempotency({ source: 'stripe', eventId }, async () => { runs += 1; return 'ok'; });

  check('first delivery is processed', first.status === 'processed');
  check('retried delivery is skipped as duplicate', second.status === 'duplicate');
  check('handler ran exactly once', runs === 1, `ran ${runs} time(s)`);

  // Concurrent duplicate deliveries: only one may win.
  let concurrentRuns = 0;
  const raceId = `evt_race_${suffix}`;
  const results = await Promise.all(
    Array.from({ length: 5 }, () =>
      withIdempotency({ source: 'stripe', eventId: raceId }, async () => { concurrentRuns += 1; return 'ok'; }),
    ),
  );
  check('5 concurrent deliveries execute the handler once',
    concurrentRuns === 1 && results.filter((r) => r.status === 'processed').length === 1,
    `handler ran ${concurrentRuns}x`);

  // A failing handler must release its claim so the provider's retry works.
  const failId = `evt_fail_${suffix}`;
  let attempts = 0;
  await withIdempotency({ source: 'stripe', eventId: failId }, async () => {
    attempts += 1; throw new Error('boom');
  }).catch(() => undefined);
  const retry = await withIdempotency({ source: 'stripe', eventId: failId }, async () => { attempts += 1; return 'ok'; });
  check('a failed handler can be retried, not silently swallowed',
    retry.status === 'processed' && attempts === 2, `attempts=${attempts}`);

  console.log('\nOnboarding stage machine:');

  check('payment advances proposal_approved → payment_complete',
    canTransition('proposal_approved', 'payment_complete'));
  check('stages cannot skip ahead', !canTransition('proposal_sent', 'active'));
  check('stages cannot run backwards', !canTransition('active', 'payment_complete'));
  check('an unknown stage is rejected', !canTransition('proposal_sent', 'wat'));
  check('a replayed payment event cannot un-onboard an active org',
    nextStage('active', 'payment_complete') === 'active');
  check('re-asserting the current stage is a no-op, not an error',
    canTransition('payment_complete', 'payment_complete'));

  console.log('\nServer-side CRM gate:');

  const org = await admin.org.create({
    data: { name: `Phase1 Org ${suffix}`, onboardingStage: 'payment_complete' },
  });
  const user = await admin.user.create({
    data: { email: `phase1-${suffix}@example.com`, name: 'Phase 1 User' },
  });
  await admin.membership.create({ data: { orgId: org.id, userId: user.id, role: 'owner' } });

  const session = {
    userId: user.id, email: user.email, orgId: org.id, orgRole: 'owner',
  } as SessionPayload;

  let blocked = false;
  try { await requireActiveOrg(session); } catch (err) { blocked = err instanceof OnboardingIncompleteError; }
  check('CRM data is refused while the org is still onboarding', blocked);

  await admin.org.update({ where: { id: org.id }, data: { onboardingStage: 'active' } });
  const allowed = await requireActiveOrg(session);
  check('CRM data is served once the org is active', allowed.org.onboardingStage === 'active');

  // Agency staff must be able to work an account that is mid-onboarding.
  await admin.org.update({ where: { id: org.id }, data: { onboardingStage: 'brand_uploaded' } });
  const agencySession = { ...session, orgRole: 'agency_admin' } as SessionPayload;
  const agencyOk = await requireActiveOrg(agencySession).then(() => true).catch(() => false);
  check('agency staff may work an onboarding account', agencyOk);
  await admin.org.update({ where: { id: org.id }, data: { onboardingStage: 'active' } });

  console.log('\nDeal stage history:');

  const deal = await admin.deal.create({
    data: { orgId: org.id, title: 'History Deal', value: 100000, stage: 'lead' },
  });
  const scoped = forOrg(org.id);
  await scoped.dealStageEvent.create({
    data: { orgId: org.id, dealId: deal.id, fromStage: 'lead', toStage: 'qualified' },
  });

  const history = await scoped.dealStageEvent.findMany({ where: { dealId: deal.id } });
  check('a stage change is recorded in history', history.length === 1 && history[0]!.toStage === 'qualified');

  const rewrote = await scoped.dealStageEvent
    .updateMany({ where: { dealId: deal.id }, data: { toStage: 'won' } })
    .then(() => true).catch(() => false);
  check('stage history cannot be rewritten by the tenant', !rewrote);

  const erased = await scoped.dealStageEvent
    .deleteMany({ where: { dealId: deal.id } })
    .then(() => true).catch(() => false);
  check('stage history cannot be deleted by the tenant', !erased);

  // Another tenant must not see this org's stage history.
  const otherOrg = await admin.org.create({ data: { name: `Phase1 Other ${suffix}` } });
  check("another tenant cannot read this org's stage history",
    (await forOrg(otherOrg.id).dealStageEvent.count()) === 0);

  check('the idempotency ledger is invisible to tenants',
    (await forOrg(org.id).processedEvent.count()) === 0);

  // ── Cleanup ───────────────────────────────────────────────
  await admin.processedEvent.deleteMany({ where: { eventId: { contains: String(suffix) } } });
  await admin.dealStageEvent.deleteMany({ where: { orgId: org.id } });
  await admin.deal.deleteMany({ where: { orgId: org.id } });
  await admin.membership.deleteMany({ where: { orgId: org.id } });
  await admin.user.delete({ where: { id: user.id } });
  await admin.org.deleteMany({ where: { id: { in: [org.id, otherOrg.id] } } });

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.error('\nPhase 1 guarantees are NOT met:');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('Phase 1 payment + gating guarantees hold.');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => admin.$disconnect());
