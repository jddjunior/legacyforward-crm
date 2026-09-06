# AGENTS.md

## What this project is

Multi-tenant CRM & agency operations platform (LegacyForward CRM). Built with Next.js 14 (App Router), Postgres (Prisma), Redis, WorkOS auth, and Stripe payments. Transformed from static DC HTML prototypes into a full-stack application.

## Tech stack

- **Frontend**: Next.js 14 with App Router, Tailwind CSS, lucide-react icons
- **Database**: PostgreSQL 16 with Prisma ORM
- **Cache/Queue**: Redis 7
- **Auth**: WorkOS (`@workos-inc/node`) — JWT session cookies, not AuthKit
- **Payments**: Stripe (checkout sessions for build fees)
- **Language**: TypeScript throughout

## How it runs

`docker-compose.base44.yml` brings up three services:
- `db` — Postgres 16
- `redis` — Redis 7
- `web` — Node 22 with source bind-mounted, runs `npm install && prisma generate && prisma migrate deploy && bootstrap-app-role && seed && next dev`

First boot installs deps, pushes schema, seeds demo data, then starts the dev server. Subsequent restarts reuse the named volumes (`lf_node_modules`, `lf_next`) and are fast.

**After editing `prisma/schema.prisma`, restart the `web` service** (`docker compose -f docker-compose.base44.yml restart web`) — `prisma generate` only runs at container startup, so a running dev server keeps a stale client and new models fail with `Cannot read properties of undefined (reading 'findMany')`.

## Secrets

Three secrets in `/run/base44/app.env` (all optional — app boots with placeholders):
- `WORKOS_API_KEY` — WorkOS server API key
- `WORKOS_CLIENT_ID` — WorkOS client ID
- `STRIPE_SECRET_KEY` — Stripe secret key

Without real WorkOS credentials, the portal/agency routes redirect to a WorkOS auth page that won't work. The public pitch route (`/pitch/[token]` or `/pitch/demo`) works without auth.

## Project structure

```
src/
  app/
    page.tsx              # Landing page
    pitch/[token]/        # Public proposal preview (gateway entry)
    portal/               # Customer portal (auth-gated)
      layout.tsx          # Sidebar shell
      page.tsx            # Dashboard
      leads/              # Lead CRUD
      customers/          # Customer CRUD
      pipeline/           # Kanban with drag-and-drop
      approvals/         # Approve/reject flow
      reviews/ services/  connections/ settings/
    agency/               # Agency console (auth-gated, agency_admin role)
      page.tsx            # Agency dashboard
      clients/            # Client list
      proposals/          # Proposal list
      approvals/          # Cross-client approval queue
      queue/ inbox/       # Unified work queue; unified inbox (leads + missed calls + reviews)
      reports/ health/    # Per-client performance; account health scoring
      calendar/ content/  # Scheduled posts by day; social content studio
      adaccounts/ agent/  # Ad platform links; call copilot + knowledge base
      billing/ templates/ # Payments + Stripe setup; reusable service offers
      onboarding/ team/   # Stage kanban; people and access
      pitchlive/ audit/   # Live pitches + change requests; cross-client audit log
      settings/           # Agency workspace config
    api/
      auth/               # login (WorkOS redirect), callback, logout
      payments/           # Stripe checkout + success handler
      proposals/[id]/approve/
      health/
  components/
    agency/               # Shared agency UI: StatGrid, Panel + EmptyState, DataTable
    Sidebar.tsx           # Portal navigation
    PipelineBoard.tsx    # Drag-and-drop kanban (client component)
    PitchClient.tsx       # Proposal preview with viewport toggle
  lib/
    db.ts                 # ADMIN Prisma client — bypasses RLS, auth/webhooks/scripts only
    rls.ts                # forSession()/forOrg() — tenant-scoped client, use this in features
    audit.ts              # writeAudit() — append-only audit trail
    format.ts             # badgeClass/money/date/duration helpers shared by agency pages
    session.ts            # JWT sign/verify (jose)
    auth.ts               # getSession/requireSession helpers
    workos.ts             # WorkOS client
    stripe.ts             # Stripe client
  middleware.ts           # Route protection (public vs auth-gated)
  actions/                # Server actions (leads, customers, deals, approvals)
prisma/
  schema.prisma           # Full data model
  seed.ts                 # Demo data (3 client orgs, agency, leads, deals, etc.)
```

## Key patterns

- **Multi-tenancy**: All tables have `orgId`. Server actions verify `orgId` matches session before mutating.
- **Auth flow**: `/api/auth/login` redirects to WorkOS → callback creates JWT cookie → middleware checks cookie on protected routes.
- **Gateway**: Public `/pitch/[token]` → approve → Stripe checkout → success advances onboarding stage.
- **Server actions**: Form mutations use `'use server'` functions with `revalidatePath` for instant updates.

## Verify it works

```bash
curl http://localhost:3000/api/health          # → {"status":"ok"}
curl http://localhost:3000/pitch/demo          # → proposal preview
# Full WorkOS auth debug loop (signup, sign-in, redirect URI, callback, route protection):
docker compose -f docker-compose.base44.yml exec web sh scripts/debug-auth.sh
# With WorkOS + Stripe configured:
#   Visit / → sign in → portal dashboard with seeded data
#   Visit /agency → agency console with all clients
```

## WorkOS + iframe preview quirks

- **WorkOS blocks its hosted sign-in page inside iframes** (CSP `frame-ancestors` only allows bolt.new/lovable/replit/etc.). Inside the Base44 preview, `SignInButton` opens `/api/auth/login` in a new tab instead. Never make the sign-in link navigate an embedded frame.
- The session cookie (`lf-session`) is `SameSite=None; Secure` so it is sent while the app runs in a third-party iframe preview.
- WorkOS's `/user_management/authenticate` needs the key as `client_secret` in the body (that's how the SDK v7 calls it) — a Bearer-only request returns `invalid_client`.
- If the sign-in lands on `redirect-uri-invalid`, the preview host changed: add `<public-preview-url>/api/auth/callback` under WorkOS dashboard → Authentication → Redirects. The public preview URL derives from `BASE44_PUBLIC_HOST_SUFFIX` (see `src/lib/origin.ts`).
- `scripts/debug-auth.sh` uses throwaway test user `debug-tester@legacyforward.test` (password in the script).


## Multi-tenancy: row-level security (Build Plan §1.1)

Tenant isolation is enforced by Postgres, **not** by application `where` clauses.

- **Two database roles.** `DATABASE_URL` is the owner role (migrations, auth, webhooks, seeds) and
  bypasses RLS. `APP_DATABASE_URL` is `app_user`, created `NOBYPASSRLS` by the RLS migration; the
  bootstrap script attaches its password from `APP_DB_PASSWORD` so no credential lives in SQL.
- **Feature code must use `forSession(session)` / `forOrg(orgId)` from `lib/rls.ts`**, never the
  `prisma` export from `lib/db.ts`. Every portal page and server action already does. The scoped
  client wraps each query in a transaction that runs
  `set_config('app.org_id', …, true)`, because policies read that setting and `SET LOCAL` only
  survives its own transaction — this is why the extension uses the array form of `$transaction`.
- **Policies default to deny.** With no `app.org_id` set, `"orgId" = current_org_id()` is NULL,
  so zero rows match. Forgetting the context fails closed, not open.
- **Agency cross-tenant access** is a deliberate exception: `forSession()` sets
  `app.agency_access=on` only for an `agency_admin` session, which is what lets the agency console
  read every client. Audit those paths with `writeAudit()`.
- **`AuditLog` is append-only.** No UPDATE/DELETE policy exists, the grants are revoked, and a
  trigger raises on either — so even the owner role cannot rewrite history. Tests that need to clean
  up must `ALTER TABLE "AuditLog" DISABLE TRIGGER audit_log_no_mutate` first.
- **`Payment.orgId` is nullable** (pre-account pitch payments), so those rows are invisible to
  `app_user`; handle them with the admin client in webhook/checkout paths.

**Schema changes now go through migrations** (`npx prisma migrate dev --name …`), not `db push` —
`db push` would drop the policies. `00000000000000_init` is the baseline of the pre-existing schema;
`00000000000001_row_level_security` adds roles, policies and the audit trigger.

Verify the gate with `npm run test:isolation` (22 assertions; also runs in CI via
`.github/workflows/tenant-isolation.yml`). It deliberately issues queries with **no** org filter, so
a pass is attributable to RLS alone.

## Phase 1 — payments, stage machine, CRM gate

- **Payment truth comes from the Stripe webhook** (`/api/webhooks/stripe`), not from the browser
  returning to `/api/payments/success` — a customer who closes the tab must still be onboarded.
  The success route remains as a UX redirect only.
- **`STRIPE_WEBHOOK_SECRET` is not set in this environment** (deliberately declined). The route
  fails closed: with no secret it returns 500 and processes nothing, so live events are rejected
  until the secret is supplied. To enable it, add the secret from Stripe → Developers → Webhooks
  (endpoint `/api/webhooks/stripe`), or `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
- **Webhooks and pitch checkout must stay in `PUBLIC_PATHS`** in `src/middleware.ts`. Both run with
  no session — the webhook authenticates by signature. The list previously named a nonexistent
  `/api/stripe-webhook`, which silently 307'd every delivery to the login page; if you rename the
  route, update the allowlist or deliveries die invisibly.
- **Idempotency**: `withIdempotency()` (`src/lib/idempotency.ts`) claims `(source, eventId)` in
  `ProcessedEvent` *before* running the handler, so concurrent retries execute it once. A handler
  that throws releases its claim so the provider's retry genuinely reprocesses.
- **`ProcessedEvent` has RLS enabled with no policy** — it is infrastructure, not tenant data, and
  is only ever touched by the admin client.
- **Onboarding stages move one step forward at a time** (`src/lib/onboarding.ts`). `nextStage()`
  never moves an org backwards, so a replayed `checkout.session.completed` cannot drag an active
  account back to `payment_complete`.
- **The CRM gate is server-side** (`src/lib/gate.ts`). The dimmed CRM in the pitch is cosmetic;
  `requireActiveOrg()` / `requireActiveOrgPage()` refuse CRM data until the org reaches `active`.
  Agency roles are exempt so staff can work accounts mid-onboarding. Onboarding, profile, settings
  and connections stay ungated so an org can finish setup.
- **`DealStageEvent` is append-only for tenants** (UPDATE/DELETE revoked), like `AuditLog`. Every
  `moveDeal` writes one history row plus an audit entry.

Verify with `npm test` (isolation + Phase 1 = 41 assertions) or `npm run test:phase1`.
