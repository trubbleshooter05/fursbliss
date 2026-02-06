type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitState>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(
  request: Request,
  key: string,
  { limit, windowMs }: RateLimitOptions
) {
  const now = Date.now();
  const entryKey = `${key}:${getClientIp(request)}`;
  const existing = rateLimitStore.get(entryKey);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(entryKey, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  const nextCount = existing.count + 1;
  rateLimitStore.set(entryKey, { count: nextCount, resetAt: existing.resetAt });
  return { success: true, remaining: limit - nextCount, resetAt: existing.resetAt };
}

export function getRetryAfterSeconds(resetAt: number) {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}
