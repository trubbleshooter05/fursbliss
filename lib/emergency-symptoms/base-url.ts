/** Canonical www origin for emergency symptom JSON-LD and absolute URLs. */
export function getFursblissSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return "https://www.fursbliss.com";
  try {
    return new URL(raw).origin;
  } catch {
    return "https://www.fursbliss.com";
  }
}

export function absoluteFursblissUrl(path: string): string {
  const base = getFursblissSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
