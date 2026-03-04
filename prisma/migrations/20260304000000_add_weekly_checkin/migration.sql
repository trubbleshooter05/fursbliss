-- CreateTable
CREATE TABLE "WeeklyCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "newSymptoms" BOOLEAN NOT NULL DEFAULT false,
    "symptomDetails" TEXT,
    "energyLevel" TEXT NOT NULL,
    "appetite" TEXT NOT NULL,
    "vetVisit" BOOLEAN NOT NULL DEFAULT false,
    "vetVisitDetails" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_petId_weekStartDate_idx" ON "WeeklyCheckIn"("petId", "weekStartDate");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_userId_createdAt_idx" ON "WeeklyCheckIn"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "WeeklyCheckIn" ADD CONSTRAINT "WeeklyCheckIn_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
