-- CreateTable
CREATE TABLE "quiz_step_events" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "step_number" INTEGER NOT NULL,
    "step_name" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_step_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_step_events_session_id_timestamp_idx" ON "quiz_step_events"("session_id", "timestamp");

-- CreateIndex
CREATE INDEX "quiz_step_events_step_number_timestamp_idx" ON "quiz_step_events"("step_number", "timestamp");
