-- CreateTable
CREATE TABLE "UxParticipant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "available" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "contactedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UxParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UxParticipant_email_key" ON "UxParticipant"("email");

-- CreateIndex
CREATE INDEX "UxParticipant_status_idx" ON "UxParticipant"("status");

-- CreateIndex
CREATE INDEX "UxParticipant_createdAt_idx" ON "UxParticipant"("createdAt");
