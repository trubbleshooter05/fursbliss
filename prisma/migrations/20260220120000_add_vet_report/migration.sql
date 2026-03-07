CREATE TABLE "VetReport" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VetReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VetReport_petId_createdAt_idx" ON "VetReport"("petId", "createdAt");

ALTER TABLE "VetReport" ADD CONSTRAINT "VetReport_petId_fkey"
    FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VetReport" ADD CONSTRAINT "VetReport_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
