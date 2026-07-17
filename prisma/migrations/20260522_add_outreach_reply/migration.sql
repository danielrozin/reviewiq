-- CreateTable
CREATE TABLE "OutreachReply" (
    "id" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "resendEventId" TEXT,
    "eventType" TEXT,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "toEmail" TEXT,
    "subject" TEXT,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "messageId" TEXT,
    "inReplyTo" TEXT,
    "references" TEXT,
    "headers" JSONB,
    "raw" JSONB,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutreachReply_dedupeKey_key" ON "OutreachReply"("dedupeKey");

-- CreateIndex
CREATE INDEX "OutreachReply_fromEmail_idx" ON "OutreachReply"("fromEmail");

-- CreateIndex
CREATE INDEX "OutreachReply_receivedAt_idx" ON "OutreachReply"("receivedAt");

-- CreateIndex
CREATE INDEX "OutreachReply_inReplyTo_idx" ON "OutreachReply"("inReplyTo");

-- CreateIndex
CREATE INDEX "OutreachReply_status_idx" ON "OutreachReply"("status");
