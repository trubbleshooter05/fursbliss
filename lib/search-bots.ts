/**
 * Detects search-engine and rich-result crawlers so app-level rate limits never throttle them.
 * Google publishes multiple user agents (Googlebot, InspectionTool, etc.).
 */
export function isLikelySearchCrawlerUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("googlebot") ||
    ua.includes("google-inspectiontool") ||
    ua.includes("storebot-google") ||
    ua.includes("googleother") ||
    ua.includes("apis-google") ||
    ua.includes("mediapartners-google") ||
    ua.includes("adsbot-google") ||
    ua.includes("bingbot") ||
    ua.includes("duckduckbot") ||
    ua.includes("yandexbot") ||
    ua.includes("baiduspider")
  );
}
