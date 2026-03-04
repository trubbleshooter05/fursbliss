-- CreateIndex
-- Improves dashboard alert calculation performance
-- Prevents full table scans when querying logs for a specific pet by date range
CREATE INDEX "HealthLog_petId_date_idx" ON "HealthLog"("petId", "date" DESC);
