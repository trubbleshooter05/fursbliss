"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { shouldCollectAnalytics } from "@/lib/ga-tracking";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Must match GoogleAnalyticsInit fallback
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-4C2EJL2XPS";

/**
 * Client component: tracks SPA route page_views once per navigation.
 * Scripts are in GoogleAnalyticsInit (layout).
 */
export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!shouldCollectAnalytics()) return;
    if (pathname?.startsWith("/admin")) return;

    const params = new URLSearchParams(window.location.search);
    const debugMode = params.has("ga_debug") || params.has("debug_mode");
    if (debugMode) {
      try {
        sessionStorage.setItem("ga_debug", "1");
      } catch {
        // no-op
      }
    }
    const keepDebug =
      debugMode ||
      (typeof sessionStorage !== "undefined" && sessionStorage.getItem("ga_debug") === "1");

    const apply = () => {
      if (typeof window.gtag !== "function") return false;
      const query = window.location.search.replace(/^\?/, "");
      const pagePath = query ? `${pathname}?${query}` : pathname;
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
        ...(keepDebug ? { debug_mode: true } : {}),
      });
      // Funnel store for homepage + pricing conversion rates
      if (pathname === "/" || pathname === "/pricing") {
        try {
          const payload = JSON.stringify({
            name: "page_view",
            path: pathname,
            params: { source_page: pagePath },
          });
          navigator.sendBeacon?.(
            "/api/analytics/funnel",
            new Blob([payload], { type: "application/json" })
          );
        } catch {
          // ignore
        }
      }
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: pagePath,
        send_page_view: false,
        ...(keepDebug ? { debug_mode: true } : {}),
      });
      return true;
    };

    if (apply()) return;
    const timer = window.setInterval(() => {
      if (apply()) window.clearInterval(timer);
    }, 50);
    return () => window.clearInterval(timer);
  }, [pathname]);

  return null;
}
