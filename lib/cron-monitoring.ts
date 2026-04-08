/**
 * Cron failure visibility: structured logs + optional webhook (no secrets created here).
 * Set CRON_FAILURE_WEBHOOK_URL in Vercel to POST JSON payloads on hard failures.
 */
export function reportCronFailure(job: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(`[cron-failure] ${job}`, { message, stack });

  const url = process.env.CRON_FAILURE_WEBHOOK_URL?.trim();
  if (!url) return;

  const body = JSON.stringify({
    job,
    message,
    at: new Date().toISOString(),
  });

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  }).catch(() => {
    /* avoid throwing from monitoring */
  });
}
