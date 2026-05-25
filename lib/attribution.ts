"use client";

const STORAGE_KEY = "fursbliss_first_touch";

type FirstTouchAttribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  landing_page: string;
  referrer: string;
};

/** Read the GA4 client ID from the _ga cookie (format: GA1.X.{clientId}). */
function readGaClientId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;)\s*_ga=([^;]+)/);
  if (!match) return "";
  // _ga value is like "GA1.1.1234567890.9876543210" — client id is everything after second dot
  const parts = decodeURIComponent(match[1]).split(".");
  if (parts.length >= 4) return `${parts[2]}.${parts[3]}`;
  return "";
}

/**
 * On first meaningful page view, persist UTM params + landing page + referrer
 * so they survive subsequent navigation before the user reaches checkout.
 * Noop if attribution is already stored (first-touch wins).
 */
export function storeFirstTouchAttribution(): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  if (localStorage.getItem(STORAGE_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const attribution: FirstTouchAttribution = {
    utm_source: params.get("utm_source") ?? "",
    utm_medium: params.get("utm_medium") ?? "",
    utm_campaign: params.get("utm_campaign") ?? "",
    landing_page: window.location.pathname + window.location.search,
    referrer: document.referrer ?? "",
  };

  // Only store if at least one meaningful signal is present
  const hasMeaningfulSignal =
    attribution.utm_source ||
    attribution.utm_medium ||
    attribution.utm_campaign ||
    (attribution.referrer && !attribution.referrer.includes("fursbliss.com"));

  if (hasMeaningfulSignal) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  }
}

/**
 * Build attribution query params to append to the Stripe checkout URL.
 * Reads first-touch from localStorage and current GA client ID from cookie.
 */
export function buildCheckoutAttributionParams(): string {
  if (typeof window === "undefined") return "";

  const stored = localStorage.getItem(STORAGE_KEY);
  const attribution: Partial<FirstTouchAttribution> = stored
    ? (JSON.parse(stored) as FirstTouchAttribution)
    : {};

  const gaClientId = readGaClientId();

  const p = new URLSearchParams();
  if (attribution.utm_source) p.set("utm_source", attribution.utm_source);
  if (attribution.utm_medium) p.set("utm_medium", attribution.utm_medium);
  if (attribution.utm_campaign) p.set("utm_campaign", attribution.utm_campaign);
  if (attribution.landing_page) p.set("landing_page", attribution.landing_page);
  if (attribution.referrer) p.set("referrer", attribution.referrer);
  if (gaClientId) p.set("ga_client_id", gaClientId);

  const str = p.toString();
  return str ? `&${str}` : "";
}
