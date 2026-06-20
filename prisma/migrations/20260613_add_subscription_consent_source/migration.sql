-- AlterTable: record the consent basis source on each email subscription (DAN-1085).
-- Paired with the existing "createdAt" opt-in timestamp, "source" makes a future
-- send defensible by scoping to what the subscriber actually consented to.
-- Default "product_alert" backfills every existing row (all current opt-ins came
-- from the per-product SmartScore alert CTA). New survey-funnel opt-ins write
-- "survey_funnel".
ALTER TABLE "EmailSubscription" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'product_alert';

-- CreateIndex: consent-segmentation queries filter by source
-- (e.g. distinct-active survey_funnel opt-ins for the DAN-1085 >=50 re-eval trigger).
CREATE INDEX "EmailSubscription_source_idx" ON "EmailSubscription"("source");
