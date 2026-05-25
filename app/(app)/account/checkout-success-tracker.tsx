"use client";

import { useEffect } from "react";
import { trackPurchaseCompleted } from "@/lib/meta-events";

type Props = {
  sessionId: string | null;
  plan: "monthly" | "yearly";
};

export function CheckoutSuccessTracker({ sessionId, plan }: Props) {
  useEffect(() => {
    if (!sessionId) return;
    // Use session_id as deduplication key — prevents double-fire on refresh
    const dedupeKey = `account_purchase_tracked_${sessionId}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "1");

    const value = plan === "yearly" ? 59 : 9;
    const contentName =
      plan === "yearly" ? "FursBliss Premium Yearly" : "FursBliss Premium Monthly";

    void trackPurchaseCompleted({
      source: "account_success",
      value,
      contentName,
      eventIdBase: sessionId,
    });
  }, [sessionId, plan]);

  return null;
}
