/**
 * Phase 0 security gate (Build Plan §1.1, §1.6).
 *
 * Proves that tenant isolation is enforced by Postgres row-level security and
 * not by application `where` clauses: the queries below deliberately omit any
 * org filter, so every pass is attributable to RLS alone.
 *
 * Run: npm run test:isolation
 */
import { PrismaClient } from '@prisma/client';
import { forOrg } from '../src/lib/rls';

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

async function throws(fn: () => Promise<unknown>) {
  try {
    await fn();
    return false;
  } catch {
    return true;
  }
}

async function main() {
  // ── Fixture: two unrelated tenants ────────────────────────
  const suffix = Date.now();
  const orgA = await admin.org.create({ data: { name: `RLS Tenant A ${suffix}` } });
  const orgB = await admin.org.create({ data: { name: `RLS Tenant B ${suffix}` } });

  const leadA = await admin.lead.create({ data: { orgId: orgA.id, name: 'Lead A', status: 'new' } });
  const leadB = await admin.lead.create({ data: { orgId: orgB.id, name: 'Lead B', status: 'new' } });
  await admin.customer.create({ data: { orgId: orgB.id, name: 'Customer B' } });
  await admin.document.create({ data: { orgId: orgB.id, title: 'Secret B', category: 'PDF' } });
  await admin.callRecord.create({ data: { orgId: orgB.id, callerName: 'Caller B' } });

  const a = forOrg(orgA.id);

  console.log('\nRead isolation (no org filter in any query):');

  const leads = await a.lead.findMany();
  check('tenant A reads only its own leads', leads.length === 1 && leads[0]!.id === leadA.id,
    `saw ${leads.length} row(s)`);

  check("tenant B's lead is invisible by id", (await a.lead.findUnique({ where: { id: leadB.id } })) === null);
  check("tenant B's customers are invisible", (await a.customer.count()) === 0);
  check("tenant B's documents are invisible", (await a.document.count()) === 0);
  check("tenant B's call recordings are invisible", (await a.callRecord.count()) === 0);
  check("tenant B's org row is invisible", (await a.org.findUnique({ where: { id: orgB.id } })) === null);
  check('tenant A can see its own org row', (await a.org.findUnique({ where: { id: orgA.id } }))?.id === orgA.id);

  console.log('\nWrite isolation:');

  const crossUpdate = await a.lead.updateMany({ where: { id: leadB.id }, data: { name: 'hijacked' } });
  check("tenant A cannot update tenant B's lead", crossUpdate.count === 0);
  check("tenant B's lead is unchanged",
    (await admin.lead.findUnique({ where: { id: leadB.id } }))?.name === 'Lead B');

  const crossDelete = await a.lead.deleteMany({ where: { id: leadB.id } });
  check("tenant A cannot delete tenant B's lead", crossDelete.count === 0);
  check("tenant B's lead still exists",
    (await admin.lead.findUnique({ where: { id: leadB.id } })) !== null);

  check('tenant A cannot forge a row into tenant B',
    await throws(() => a.lead.create({ data: { orgId: orgB.id, name: 'forged' } })));

  // RLS must not break legitimate same-tenant writes.
  const ownCreate = await a.lead.create({ data: { orgId: orgA.id, name: 'Own lead' } });
  check('tenant A can create its own lead', ownCreate.orgId === orgA.id);
  const ownUpdate = await a.lead.updateMany({ where: { id: ownCreate.id }, data: { status: 'qualified' } });
  check('tenant A can update its own lead', ownUpdate.count === 1);
  const ownDelete = await a.lead.deleteMany({ where: { id: ownCreate.id } });
  check('tenant A can delete its own lead', ownDelete.count === 1);

  console.log('\nAudit log is append-only (§1.6):');

  const entry = await admin.auditLog.create({
    data: { orgId: orgA.id, action: 'created', entity: 'Lead', entityId: leadA.id },
  });
  check('audit entries can be written',
    (await a.auditLog.count()) === 1);
  check('audit entries cannot be updated',
    await throws(() => admin.auditLog.update({ where: { id: entry.id }, data: { action: 'deleted' } })));
  check('audit entries cannot be deleted',
    await throws(() => admin.auditLog.delete({ where: { id: entry.id } })));
  check("tenant A cannot read tenant B's audit trail", (await a.auditLog.count({ where: {} })) === 1);

  console.log('\nRuntime role privileges:');

  const [role] = await admin.$queryRawUnsafe<{ rolbypassrls: boolean; rolsuper: boolean }[]>(
    `SELECT rolbypassrls, rolsuper FROM pg_roles WHERE rolname = 'app_user'`,
  );
  check('app_user cannot bypass RLS', role?.rolbypassrls === false);
  check('app_user is not a superuser', role?.rolsuper === false);

  const unprotected = await admin.$queryRawUnsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE '_prisma%'
        AND NOT (SELECT relrowsecurity FROM pg_class WHERE oid = (quote_ident(tablename))::regclass)`,
  );
  check('every table has RLS enabled',
    unprotected.length === 0,
    unprotected.map((t) => t.tablename).join(', '));

  // ── Cleanup ───────────────────────────────────────────────
  await admin.$executeRawUnsafe(`DELETE FROM "Lead" WHERE "orgId" IN ($1, $2)`, orgA.id, orgB.id);
  await admin.$executeRawUnsafe(`DELETE FROM "Customer" WHERE "orgId" = $1`, orgB.id);
  await admin.$executeRawUnsafe(`DELETE FROM "Document" WHERE "orgId" = $1`, orgB.id);
  await admin.$executeRawUnsafe(`DELETE FROM "CallRecord" WHERE "orgId" = $1`, orgB.id);
  await admin.$executeRawUnsafe(`ALTER TABLE "AuditLog" DISABLE TRIGGER audit_log_no_mutate`);
  await admin.$executeRawUnsafe(`DELETE FROM "AuditLog" WHERE "orgId" = $1`, orgA.id);
  await admin.$executeRawUnsafe(`ALTER TABLE "AuditLog" ENABLE TRIGGER audit_log_no_mutate`);
  await admin.org.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.error('\nTenant isolation is NOT enforced:');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('Tenant isolation enforced at the database layer.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => admin.$disconnect());
