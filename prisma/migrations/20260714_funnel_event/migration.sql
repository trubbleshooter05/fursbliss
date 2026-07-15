-- CreateTable
CREATE TABLE IF NOT EXISTS "FunnelEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "planName" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    "userStatus" TEXT,
    "buttonText" TEXT,
    "destinationUrl" TEXT,
    "transactionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FunnelEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FunnelEvent_name_createdAt_idx" ON "FunnelEvent"("name", "createdAt");
CREATE INDEX IF NOT EXISTS "FunnelEvent_createdAt_idx" ON "FunnelEvent"("createdAt");

-- Dedupes conversion / transaction-scoped events (NULL transactionId still allows many rows in Postgres).
CREATE UNIQUE INDEX IF NOT EXISTS "FunnelEvent_name_transactionId_key" ON "FunnelEvent"("name", "transactionId");
