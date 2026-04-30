-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "consentCategories" JSONB NOT NULL,
    "ipHash" TEXT,
    "policyVersion" TEXT NOT NULL,
    "userAgent" TEXT,
    "geoCountry" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsentRecord_visitorId_idx" ON "ConsentRecord"("visitorId");

-- CreateIndex
CREATE INDEX "ConsentRecord_grantedAt_idx" ON "ConsentRecord"("grantedAt");

-- CreateIndex
CREATE INDEX "ConsentRecord_geoCountry_idx" ON "ConsentRecord"("geoCountry");
