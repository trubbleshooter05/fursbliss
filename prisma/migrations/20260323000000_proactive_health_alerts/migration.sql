-- Replace legacy HealthAlert (alertLevel/alertReason) with proactive alert model + breed risks

DROP TABLE IF EXISTS "HealthAlert";

CREATE TABLE "BreedHealthRisk" (
    "id" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "ageOnset" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreedHealthRisk_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BreedHealthRisk_breed_condition_key" ON "BreedHealthRisk"("breed", "condition");
CREATE INDEX "BreedHealthRisk_breed_idx" ON "BreedHealthRisk"("breed");

CREATE TABLE "HealthAlert" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "metric" TEXT,
    "trendData" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "breedRiskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthAlert_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HealthAlert_petId_idx" ON "HealthAlert"("petId");
CREATE INDEX "HealthAlert_userId_idx" ON "HealthAlert"("userId");
CREATE INDEX "HealthAlert_createdAt_idx" ON "HealthAlert"("createdAt");
CREATE INDEX "HealthAlert_petId_read_idx" ON "HealthAlert"("petId", "read");
CREATE UNIQUE INDEX "HealthAlert_petId_breedRiskId_key" ON "HealthAlert"("petId", "breedRiskId");

ALTER TABLE "HealthAlert" ADD CONSTRAINT "HealthAlert_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HealthAlert" ADD CONSTRAINT "HealthAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HealthAlert" ADD CONSTRAINT "HealthAlert_breedRiskId_fkey" FOREIGN KEY ("breedRiskId") REFERENCES "BreedHealthRisk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
