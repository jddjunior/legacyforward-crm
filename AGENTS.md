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
- `web` — Node 22 with source bind-mounted, runs `npm install && prisma generate && prisma db push && seed && next dev`

First boot installs deps, pushes schema, seeds demo data, then starts the dev server. Subsequent restarts reuse the named volumes (`lf_node_modules`, `lf_next`) and are fast.

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
    api/
      auth/               # login (WorkOS redirect), callback, logout
      payments/           # Stripe checkout + success handler
      proposals/[id]/approve/
      health/
  components/
    Sidebar.tsx           # Portal navigation
    PipelineBoard.tsx    # Drag-and-drop kanban (client component)
    PitchClient.tsx       # Proposal preview with viewport toggle
    PlaceholderPage.tsx  # Coming-soon pages
  lib/
    db.ts                 # Prisma client
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
# With WorkOS + Stripe configured:
#   Visit / → sign in → portal dashboard with seeded data
#   Visit /agency → agency console with all clients
```
