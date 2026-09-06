import { PrismaClient } from '@prisma/client';
import type { SessionPayload } from '@/lib/session';

/**
 * Tenant-scoped database access (Build Plan §1.1).
 *
 * Connects as `app_user`, a NOBYPASSRLS role, so Postgres row-level security
 * decides what is visible — application `where` clauses are a convenience,
 * not the isolation boundary.
 *
 * Every operation is wrapped in a transaction whose first statement sets
 * `app.org_id` locally, because RLS policies read that setting and
 * `set_config(..., true)` only survives inside its own transaction.
 */
const globalForRls = globalThis as unknown as { rlsPrisma?: PrismaClient };

function baseClient() {
  const url = process.env.APP_DATABASE_URL;
  if (!url) throw new Error('APP_DATABASE_URL is not set — RLS client cannot start');
  return new PrismaClient({ log: ['error'], datasources: { db: { url } } });
}

const rlsPrisma = globalForRls.rlsPrisma ?? baseClient();
if (process.env.NODE_ENV !== 'production') globalForRls.rlsPrisma = rlsPrisma;

type Context = { orgId: string; agencyAccess?: boolean };

function scopedClient({ orgId, agencyAccess = false }: Context) {
  return rlsPrisma.$extends({
    query: {
      $allOperations({ args, query }) {
        return rlsPrisma.$transaction([
          rlsPrisma.$executeRaw`SELECT set_config('app.org_id', ${orgId}, true),
                                       set_config('app.agency_access', ${agencyAccess ? 'on' : 'off'}, true)`,
          query(args),
        ]).then(([, result]) => result) as ReturnType<typeof query>;
      },
    },
  });
}

/** Database access for one tenant. Rows outside `orgId` are invisible. */
export function forOrg(orgId: string) {
  return scopedClient({ orgId });
}

/**
 * Database access for a signed-in session. An `agency_admin` session gets
 * cross-tenant reach because the agency console operates every client account;
 * callers must audit that access (see `lib/audit.ts`).
 */
export function forSession(session: SessionPayload) {
  if (!session.orgId) throw new Error('Session has no org context');
  return scopedClient({
    orgId: session.orgId,
    agencyAccess: session.orgRole === 'agency_admin',
  });
}

export type ScopedPrisma = ReturnType<typeof forOrg>;
