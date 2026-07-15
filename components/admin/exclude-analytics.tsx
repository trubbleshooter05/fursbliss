"use client";

import { useEffect } from "react";
import { excludeAnalyticsForAdminSession } from "@/lib/ga-tracking";

/** Sets an exclusion cookie/localStorage flag for admin browsers. */
export function ExcludeAnalytics() {
  useEffect(() => {
    excludeAnalyticsForAdminSession();
  }, []);
  return null;
}
