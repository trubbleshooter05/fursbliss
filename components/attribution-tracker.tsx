"use client";

import { useEffect } from "react";
import { storeFirstTouchAttribution } from "@/lib/attribution";

/** Persists first-touch UTM + referrer on the user's first meaningful landing. */
export function AttributionTracker() {
  useEffect(() => {
    storeFirstTouchAttribution();
  }, []);

  return null;
}
