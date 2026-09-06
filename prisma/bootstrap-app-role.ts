/**
 * Attaches a login password to the NOBYPASSRLS `app_user` role created by the
 * row-level-security migration. Kept out of the migration itself so no
 * credential is ever committed to SQL — the value comes from the environment.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const password = process.env.APP_DB_PASSWORD;
  if (!password) throw new Error('APP_DB_PASSWORD is not set');

  await prisma.$executeRawUnsafe(
    `ALTER ROLE app_user LOGIN PASSWORD ${quote(password)}`,
  );

  const [{ rolbypassrls }] = await prisma.$queryRawUnsafe<{ rolbypassrls: boolean }[]>(
    `SELECT rolbypassrls FROM pg_roles WHERE rolname = 'app_user'`,
  );
  if (rolbypassrls) throw new Error('app_user must not be able to bypass RLS');

  console.log('app_user ready (NOBYPASSRLS, login enabled)');
}

/** Postgres literal quoting — ALTER ROLE cannot take a bind parameter. */
function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
