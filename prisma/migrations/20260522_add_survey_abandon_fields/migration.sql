-- AlterTable: instrument survey abandonment (DAN-699).
-- "event" discriminates completed submissions from drop-off, "reachedStep"
-- records where in the funnel the user left, and "userAgent" preserves the
-- raw client UA for the drop-off analysis (deviceType is the coarse bucket).
ALTER TABLE "SmartreviewSurvey" ADD COLUMN "event" TEXT;
ALTER TABLE "SmartreviewSurvey" ADD COLUMN "reachedStep" TEXT;
ALTER TABLE "SmartreviewSurvey" ADD COLUMN "userAgent" TEXT;

-- CreateIndex: funnel queries filter on event ("form_abandon" vs completed).
CREATE INDEX "SmartreviewSurvey_event_idx" ON "SmartreviewSurvey"("event");
