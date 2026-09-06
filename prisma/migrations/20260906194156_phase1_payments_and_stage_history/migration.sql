-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT;

-- CreateTable
CREATE TABLE "ProcessedEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealStageEvent" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealStageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEvent_source_eventId_key" ON "ProcessedEvent"("source", "eventId");

-- CreateIndex
CREATE INDEX "DealStageEvent_orgId_idx" ON "DealStageEvent"("orgId");

-- CreateIndex
CREATE INDEX "DealStageEvent_dealId_idx" ON "DealStageEvent"("dealId");

-- AddForeignKey
ALTER TABLE "DealStageEvent" ADD CONSTRAINT "DealStageEvent_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── RLS for the new tables (Build Plan §1.1) ────────────────
-- Every table added from here on must be brought under a policy in the same
-- migration; the isolation suite fails the build if one is left unprotected.

ALTER TABLE "DealStageEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DealStageEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "DealStageEvent"
  USING ("orgId" = current_org_id() OR has_agency_access())
  WITH CHECK ("orgId" = current_org_id() OR has_agency_access());

-- Stage history is an audit surface: correcting the past is not a tenant
-- operation, so the runtime role may append and read but never rewrite.
REVOKE UPDATE, DELETE ON "DealStageEvent" FROM app_user;

-- ProcessedEvent is infrastructure, not tenant data: it is written only by
-- webhook handlers using the admin client. RLS is enabled with no policy, so
-- the runtime role can see nothing at all.
ALTER TABLE "ProcessedEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProcessedEvent" FORCE ROW LEVEL SECURITY;
