-- CreateTable
-- Email consolidation logging to prevent spam (3+ emails/week)
-- Tracks all automated email sends for throttling purposes
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailType" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Fast lookups for "did this user get any email recently?"
CREATE INDEX "EmailLog_userId_sentAt_idx" ON "EmailLog"("userId", "sentAt");

-- CreateIndex
-- Fast lookups for "did this user get a specific email type recently?"
CREATE INDEX "EmailLog_userId_emailType_sentAt_idx" ON "EmailLog"("userId", "emailType", "sentAt");

-- AddForeignKey
-- Cascade delete logs when user is deleted
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
