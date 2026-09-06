-- ============================================================
-- Phase 0 security gate: multi-tenant isolation at the DB layer
-- Build Plan §1.1 (RLS keyed on org_id) and §1.6 (append-only audit log)
-- ============================================================
-- Isolation is enforced by Postgres, not by application WHERE clauses.
-- The runtime role (app_user) is NOBYPASSRLS, so a missed filter in app
-- code cannot leak another tenant's rows.

-- ── Request context helpers ─────────────────────────────────
-- app.org_id is set per request with set_config(..., true) so it is
-- scoped to the surrounding transaction only.

CREATE OR REPLACE FUNCTION current_org_id() RETURNS text
  LANGUAGE sql STABLE
  AS $$ SELECT NULLIF(current_setting('app.org_id', true), '') $$;

-- Agency staff are cross-tenant by design (they operate every client
-- account). This flag is only ever set for an agency_admin session and
-- every use is written to the audit log.
CREATE OR REPLACE FUNCTION has_agency_access() RETURNS boolean
  LANGUAGE sql STABLE
  AS $$ SELECT coalesce(current_setting('app.agency_access', true) = 'on', false) $$;

-- ── Runtime role ────────────────────────────────────────────
-- Created without LOGIN; the deploy/bootstrap step attaches a password.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN NOBYPASSRLS;
  ELSE
    ALTER ROLE app_user NOBYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- ── Tenant policies on every org-scoped table ───────────────
-- NULL context yields NULL = false, so the default is deny-all.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'Membership', 'Proposal', 'Payment', 'Lead', 'Customer', 'Deal',
    'Approval', 'Review', 'Service', 'Connection', 'SocialPost',
    'SeoKeyword', 'CallRecord', 'Document', 'WebsitePage'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format($f$
      CREATE POLICY tenant_isolation ON %I
        USING ("orgId" = current_org_id() OR has_agency_access())
        WITH CHECK ("orgId" = current_org_id() OR has_agency_access())
    $f$, t);
  END LOOP;
END
$$;

-- Org is scoped by its own primary key.
ALTER TABLE "Org" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Org" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "Org";
CREATE POLICY tenant_isolation ON "Org"
  USING ("id" = current_org_id() OR has_agency_access())
  WITH CHECK ("id" = current_org_id() OR has_agency_access());

-- ChangeRequest inherits its tenant through its proposal.
ALTER TABLE "ChangeRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChangeRequest" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ChangeRequest";
CREATE POLICY tenant_isolation ON "ChangeRequest"
  USING (
    has_agency_access() OR EXISTS (
      SELECT 1 FROM "Proposal" p
      WHERE p."id" = "ChangeRequest"."proposalId" AND p."orgId" = current_org_id()
    )
  )
  WITH CHECK (
    has_agency_access() OR EXISTS (
      SELECT 1 FROM "Proposal" p
      WHERE p."id" = "ChangeRequest"."proposalId" AND p."orgId" = current_org_id()
    )
  );

-- A user is visible to a tenant only where a membership ties them to it.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "User";
CREATE POLICY tenant_isolation ON "User"
  USING (
    has_agency_access() OR EXISTS (
      SELECT 1 FROM "Membership" m
      WHERE m."userId" = "User"."id" AND m."orgId" = current_org_id()
    )
  )
  WITH CHECK (
    has_agency_access() OR EXISTS (
      SELECT 1 FROM "Membership" m
      WHERE m."userId" = "User"."id" AND m."orgId" = current_org_id()
    )
  );

-- ── Audit log: append-only (§1.6) ───────────────────────────
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "AuditLog";
DROP POLICY IF EXISTS audit_select ON "AuditLog";
DROP POLICY IF EXISTS audit_insert ON "AuditLog";

CREATE POLICY audit_select ON "AuditLog" FOR SELECT
  USING ("orgId" = current_org_id() OR has_agency_access());

CREATE POLICY audit_insert ON "AuditLog" FOR INSERT
  WITH CHECK ("orgId" = current_org_id() OR has_agency_access());

-- No UPDATE or DELETE policy exists, so both are denied for app_user.
REVOKE UPDATE, DELETE ON "AuditLog" FROM app_user;

-- Trigger makes append-only true even for the table owner / admin role,
-- so the Audit Log screen can honestly claim the history is immutable.
CREATE OR REPLACE FUNCTION audit_log_is_append_only() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only: % is not permitted', TG_OP;
END
$$;

DROP TRIGGER IF EXISTS audit_log_no_mutate ON "AuditLog";
CREATE TRIGGER audit_log_no_mutate
  BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION audit_log_is_append_only();
