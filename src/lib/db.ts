import { PrismaClient } from '@prisma/client';

/**
 * Admin database client — connects as the owner role and therefore BYPASSES
 * row-level security. Restrict its use to paths that legitimately have no
 * tenant context yet:
 *   - authentication (finding/creating a user before an org is known)
 *   - Stripe/provider webhooks (no session)
 *   - migrations, seeds, and operational scripts
 *
 * Everything that runs on behalf of a signed-in user must go through
 * `forSession()` / `forOrg()` in `lib/rls.ts` instead, so Postgres enforces
 * tenant isolation (Build Plan §1.1).
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
