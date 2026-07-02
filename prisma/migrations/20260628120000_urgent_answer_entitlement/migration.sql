-- CreateTable
CREATE TABLE "UrgentAnswerEntitlement" (
    "id" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "stripeCustomerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "consumedAt" TIMESTAMP(3),
    "claimToken" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrgentAnswerEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UrgentAnswerEntitlement_checkoutSessionId_key" ON "UrgentAnswerEntitlement"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "UrgentAnswerEntitlement_claimToken_key" ON "UrgentAnswerEntitlement"("claimToken");

-- CreateIndex
CREATE INDEX "UrgentAnswerEntitlement_email_idx" ON "UrgentAnswerEntitlement"("email");

-- CreateIndex
CREATE INDEX "UrgentAnswerEntitlement_userId_idx" ON "UrgentAnswerEntitlement"("userId");

-- CreateIndex
CREATE INDEX "UrgentAnswerEntitlement_status_idx" ON "UrgentAnswerEntitlement"("status");

-- AddForeignKey
ALTER TABLE "UrgentAnswerEntitlement" ADD CONSTRAINT "UrgentAnswerEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
