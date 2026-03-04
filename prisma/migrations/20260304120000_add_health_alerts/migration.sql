-- CreateTable
CREATE TABLE "HealthAlert" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertLevel" TEXT NOT NULL,
    "alertReason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "HealthAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthAlert_petId_resolvedAt_idx" ON "HealthAlert"("petId", "resolvedAt");

-- CreateIndex
CREATE INDEX "HealthAlert_userId_alertLevel_resolvedAt_idx" ON "HealthAlert"("userId", "alertLevel", "resolvedAt");

-- AddForeignKey
ALTER TABLE "HealthAlert" ADD CONSTRAINT "HealthAlert_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
