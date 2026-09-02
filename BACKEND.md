# Backend requirements — Customer CRM/CDP Portal

Everything the front end currently fakes with in-memory state, and what has to exist server-side to make it real. Written against `Customer Portal v2.dc.html`.

---

## 1. Shape of the system

Multi-tenant. Three actor types:

- **Agency admin** — sees all tenants, publishes to Approvals, runs the agentic retrieval layer.
- **Customer (contractor)** — one org, the portal as built.
- **System** — cron workers, webhook receivers, sync jobs.

Every table is scoped by `org_id`. Enforce it at the database layer (Postgres row-level security with a `current_setting('app.org_id')` policy), not in application code — one missed `WHERE` clause in a multi-tenant CRM leaks another contractor's pipeline.

Recommended stack, given the feature set: Postgres + pgvector, Redis (queue + cache), S3-compatible object storage, a worker pool (BullMQ/Celery/Sidekiq), and a webhook ingress that writes to a queue rather than processing inline.

---

## 2. Auth and onboarding gate

The pitch gateway is an access-control state machine, not a UI state. `org.onboarding_stage` drives what the portal unlocks:

```
proposal_sent → proposal_approved → payment_complete → account_created
→ brand_uploaded → connections_linked → reviews_approved → active
```

The dimmed CRM behind the pitch tool must be **server-side gated** — if the API returns real data before `stage = active`, anyone can read it out of the network tab regardless of the opacity overlay.

Needed:

- Magic-link or OAuth sign-in, sessions in httpOnly cookies, refresh rotation.
- Signed, expiring proposal links (JWT with `org_id` + `proposal_id`, ~14-day TTL) so a prospect reaches the pitch tool before an account exists.
- Roles: `owner`, `manager`, `viewer`, `agency_admin`. The **Invite someone** modal writes an `invitations` row (email, role, token, `expires_at`) and sends mail; accepting creates the user and burns the token.
- Audit log on every approval, price change, and connection event — this is what protects the agency in a billing dispute.

---

## 3. Core data model

| Domain | Tables |
|---|---|
| Tenancy | `orgs`, `users`, `memberships`, `invitations`, `audit_log` |
| Pitch | `proposals`, `proposal_pages`, `change_requests`, `payments` |
| CRM | `leads`, `customers`, `deals`, `deal_stage_events`, `activities`, `notes` |
| Tracking | `tracking_events`, `calls`, `form_submissions`, `attribution_touches`, `utm_params` |
| Approvals | `approvals`, `approval_items`, `approval_comments` |
| Reviews | `reviews`, `review_sources`, `review_replies` |
| Content | `social_posts`, `ad_campaigns`, `ad_creatives`, `seo_tasks`, `keyword_rankings` |
| Catalog | `services`, `service_price_history` |
| Assets | `media_buckets`, `media_assets`, `documents`, `document_chunks` |
| Integrations | `connections`, `connection_tokens`, `sync_runs`, `webhook_events` |
| Agentic | `wiki_entries`, `embeddings` |

Two notes that matter later:

- `deal_stage_events` (append-only) rather than mutating `deals.stage` — the Pipeline's stage-age counters and any velocity reporting need history, and drag-and-drop that only overwrites a column throws it away.
- `attribution_touches` as its own table, one row per touch, so first-touch vs last-touch is a query and not a stored guess.

---

## 4. Feature by feature

### Website pitch tool
- Proposal pages served in the iframe: either a real staging deploy per prospect (subdomain + Cloudflare/Vercel preview) or stored page HTML rendered from a template.
- `POST /proposals/:id/change-requests` — the change list must persist per prospect and survive reload. Each row: page, element reference, request text, status.
- `POST /proposals/:id/approve` → transitions stage, snapshots the approved design, hands the change list to the agency's work queue.
- Viewport toggles are client-only. No backend.

### Payment
- Stripe: Checkout Session or Payment Intent for the build fee, Subscription for the retainer. Store `stripe_customer_id`, `subscription_id`, `price_id`.
- Webhooks to consume: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated/deleted`. Verify signatures; make handlers idempotent on `event.id`.
- Payment success is what advances onboarding — never let the client assert it.

### Lead Tracking
The heaviest integration surface.

- **Calls** — CallRail (or Twilio) dynamic number insertion. Webhook `post_call` gives duration, recording URL, caller ID, and the session's UTM/gclid. Store the recording as a signed-URL reference; do not proxy audio through your app server.
- **Transcript + summary** — Whisper or CallRail's own transcription, then an LLM summary. Queue it; don't block the webhook.
- **Forms** — your own endpoint capturing UTM params, `gclid`/`fbclid`/`ttclid`, landing page, referrer, device, and a first-party session cookie set on first visit.
- **Cost data** — Google Ads API (`customer.searchStream` on campaign/keyword) and Meta Insights API for spend, so cost-per-lead is computed from real numbers. Daily sync.
- **Attribution** — join click IDs to platform reports; `gclid` for Google, `fbclid` for Meta. Note that iOS privacy loss means some paid-social touches will resolve to "unattributed"; the UI currently claims zero, which will need to become a real count.
- Spam/robocall filtering: duration threshold + a blocklist + optional carrier-level screening.

### Approvals
- `POST /approvals/:id/approve` / `request-changes`, both writing `audit_log`.
- Approval of an ad or social item must actually *do* something downstream — flip `social_posts.status` to `scheduled`, resume the paused Meta/Google campaign. Otherwise the approval is theater.
- Notify the agency (email + Slack webhook) on decision.

### Leads / Customers / Pipeline
- Standard CRUD. `POST /leads` and `POST /customers` back the Add drawers, with server-side validation and duplicate detection on email/phone.
- Pipeline drag: `PATCH /deals/:id` writing a `deal_stage_events` row. Debounce client-side, and reconcile with an optimistic-lock version so two users dragging the same card don't clobber each other.
- Won stage → auto-create the `customers` record.

### Reviews
- **Google** — Business Profile API (`accounts.locations.reviews`); reply write-back is supported.
- **Facebook** — Graph API page ratings, requires `pages_read_engagement` and app review.
- **Yelp** — Fusion API returns only three review excerpts per business and its terms restrict storing/displaying them. Treat Yelp as display-with-link, not a syncable source. Same caution for several aggregators.
- Nightly pull → `pending` state → customer approves → publishes to the site widget. The approve/publish split the UI shows is correct; back it with a `reviews.publish_state` column.

### Socials calendar
- OAuth per platform. Scheduling: store the post, let a worker publish at `scheduled_for` via Meta Graph, Instagram Content Publishing, TikTok Content Posting, LinkedIn UGC.
- Each platform has real constraints — IG requires a public image URL and a two-step container/publish, TikTok needs its own audit, and most require Business/Creator accounts. Budget for app review on each; this is weeks, not days.
- Media must be uploaded and validated (aspect, size, duration) before the publish window.

### Ads calendar
- Google Ads API (developer token + basic access approval) and Meta Marketing API for campaign read, spend, pause/resume.
- Change requests from the portal should create a task, not write to the ad account directly — a customer-triggered live budget edit is how accounts get wrecked.

### SEO
- Search Console API for queries/impressions/CTR/position; GA4 Data API for sessions and conversions.
- Rank tracking needs a third-party provider (DataForSEO, SerpApi) — scraping Google yourself is a ToS and reliability problem.
- Cache aggressively; both APIs are quota-limited and slow.

### Services
- CRUD with `service_price_history` on every price/margin change, and margin computed server-side from cost + price so the two can't drift.
- Price changes route through Approvals if the service is published on the website.

### Media buckets
- S3 with presigned direct uploads (never proxy large files through the app). Buckets are `media_buckets` rows; assets carry `bucket_id`, EXIF, dimensions, and labels.
- Derivatives on upload: thumbnail, web-optimized, and for video an HLS transcode (MediaConvert/Mux).
- Auto-tagging for agentic retrieval: vision model captions ("before/after", "crew", "job site") stored as searchable text — this is what makes the buckets useful to the admin agent rather than just tidy.

### Documents wiki
- Upload → text extraction (PDF/DOCX/OCR for scans) → chunk → embed → pgvector.
- Full-text search (Postgres `tsvector`) for the human search box, vector search for the agent. Both, not one.
- Version history and a `documents.status` for supersede/archive.

### Connections
- OAuth2 per provider with PKCE; refresh tokens encrypted at rest (envelope encryption via KMS, not a column in plaintext).
- `sync_runs` table with status, cursor, error, next-run — the UI's "Connected" pill should reflect last successful sync, not just token presence. A stale-but-authorized connection is the common failure mode and currently invisible.
- Token refresh worker ahead of expiry; alert the customer when a re-auth is genuinely required.

---

## 5. Agentic layer (brand wiki)

The onboarding brand upload feeds this, and it's the piece with the most leverage:

- Normalize brand inputs (brand kit, tone, service area, differentiators, pricing posture) into `wiki_entries` — structured, not a blob.
- Embed everything retrievable: wiki entries, document chunks, media captions, service descriptions, won/lost reasons, review text.
- One retrieval endpoint for the admin agent: `POST /agent/retrieve` with `org_id`, query, and source filters, returning ranked chunks with provenance.
- Scope every retrieval by `org_id` inside the query itself. A vector index that silently returns another tenant's brand material is the worst bug this system can have.

---

## 6. Scheduled work

| Job | Cadence |
|---|---|
| Ad spend + performance sync | hourly |
| GSC / GA4 pull | daily |
| Review pull | nightly |
| Rank tracking | weekly |
| Social publish worker | every minute |
| Token refresh sweep | every 15 min |
| Stale-connection alerting | daily |
| Embedding backfill | on upload + nightly repair |
| Digest email | weekly |

---

## 7. Cross-cutting

- **Idempotency** on every webhook and every publish action (`Idempotency-Key` + a processed-events table). Platforms retry; duplicate posts and double-charged cards are the cost of skipping this.
- **Rate limiting** per org, and a circuit breaker per provider so one platform outage doesn't stall the queue.
- **Call recording consent** — two-party-consent states require an announcement on the call. Legal requirement, not a setting.
- **PII** — leads and call recordings are personal data. Retention policy, deletion endpoint, encryption at rest, and a signed-URL TTL short enough to matter.
- **Observability** — per-connection sync dashboards; the failure you'll actually chase is "why is this contractor's lead count wrong", which is nearly always a broken sync three days ago.

---

## 8. Suggested build order

1. Tenancy, auth, RLS, audit log.
2. Proposal + Stripe + onboarding state machine (unblocks the gate).
3. Leads/Customers/Pipeline CRUD (the CRM has standalone value immediately).
4. Storage, media buckets, documents + embeddings.
5. CallRail + form capture + attribution (highest customer-perceived value).
6. Google stack: GSC, GA4, GBP reviews, Ads.
7. Approvals wired to real downstream actions.
8. Meta/TikTok publishing last — the app-review timelines are the long pole, so start those submissions early even though the code ships last.
