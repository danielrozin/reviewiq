-- CreateTable
CREATE TABLE "OutreachReply" (
    "id" TEXT NOT NULL,
    "resendEmailId" TEXT NOT NULL,
    "messageId" TEXT,
    "inReplyTo" TEXT,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "rawHeaders" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "OutreachReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutreachReply_resendEmailId_key" ON "OutreachReply"("resendEmailId");

-- CreateIndex
CREATE INDEX "OutreachReply_inReplyTo_idx" ON "OutreachReply"("inReplyTo");

-- CreateIndex
CREATE INDEX "OutreachReply_fromEmail_idx" ON "OutreachReply"("fromEmail");

-- CreateIndex
CREATE INDEX "OutreachReply_receivedAt_idx" ON "OutreachReply"("receivedAt");
