/**
 * Shared GA4 collection guards and event parameter helpers.
 * Keep production tracking intact; exclude obvious non-customer traffic.
 */

export type GaFunnelParams = {
  source_page?: string;
  plan_name?: string;
  price?: number;
  currency?: string;
  user_status?: string;
  button_text?: string;
  destination_url?: string;
  transaction_id?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
};

const EXCLUDE_HOST_SUFFIXES = [".vercel.app"];

/** True when we should send GA4 / funnel analytics from the browser. */
export function shouldCollectAnalytics(hostname?: string): boolean {
  if (typeof window === "undefined" && !hostname) {
    return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  }

  const host =
    hostname ??
    (typeof window !== "undefined" ? window.location.hostname : "") ??
    "";

  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
    return false;
  }
  if (EXCLUDE_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return false;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") {
    return false;
  }
  if (typeof document !== "undefined") {
    try {
      if (document.cookie.includes("fb_ga_exclude=1")) return false;
      if (window.localStorage?.getItem("fb_ga_exclude") === "1") return false;
    } catch {
      // ignore
    }
  }
  return true;
}

/** Mark this browser as admin/dev so subsequent hits are excluded. */
export function excludeAnalyticsForAdminSession(): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = "fb_ga_exclude=1; path=/; max-age=31536000; SameSite=Lax";
    window.localStorage?.setItem("fb_ga_exclude", "1");
  } catch {
    // ignore
  }
}

export function cleanGaParams(params?: GaFunnelParams): Record<string, string | number | boolean> {
  if (!params) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    out[key] = value;
  }
  return out;
}

export function buildUtmUrl(
  path: string,
  opts: { source: string; medium: string; campaign: string; content?: string; term?: string }
): string {
  const base = path.startsWith("http")
    ? path
    : `https://www.fursbliss.com${path.startsWith("/") ? path : `/${path}`}`;
  const url = new URL(base);
  url.searchParams.set("utm_source", opts.source);
  url.searchParams.set("utm_medium", opts.medium);
  url.searchParams.set("utm_campaign", opts.campaign);
  if (opts.content) url.searchParams.set("utm_content", opts.content);
  if (opts.term) url.searchParams.set("utm_term", opts.term);
  return url.toString();
}

/** Documented channel presets for growth links. */
export const UTM_PRESETS = {
  youtube: { source: "youtube", medium: "social", campaign: "fursbliss_growth" },
  tiktok: { source: "tiktok", medium: "social", campaign: "fursbliss_growth" },
  instagram: { source: "instagram", medium: "social", campaign: "fursbliss_growth" },
  reddit: { source: "reddit", medium: "social", campaign: "fursbliss_growth" },
  email: { source: "email", medium: "email", campaign: "fursbliss_growth" },
  outreach: { source: "outreach", medium: "community", campaign: "fursbliss_growth" },
  facebook_page: { source: "fb-page", medium: "social", campaign: "daily-content" },
  facebook_groups: { source: "fb-senior-dog", medium: "social", campaign: "community" },
} as const;
