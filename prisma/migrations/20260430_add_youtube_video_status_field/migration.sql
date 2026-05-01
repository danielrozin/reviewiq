-- AlterTable: track richer YouTube video state ("active" | "broken" | "removed")
ALTER TABLE "YouTubeVideo" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

-- Backfill: any video that was previously deactivated by the validator gets the
-- "broken" label so the new field matches the existing isActive flag.
UPDATE "YouTubeVideo" SET "status" = 'broken' WHERE "isActive" = false;

-- CreateIndex
CREATE INDEX "YouTubeVideo_status_idx" ON "YouTubeVideo"("status");
