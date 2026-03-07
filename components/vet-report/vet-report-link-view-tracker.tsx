"use client";

import { useEffect } from "react";
import { trackMetaCustomEvent } from "@/lib/meta-events";

export function VetReportLinkViewTracker({
  reportId,
  petName,
}: {
  reportId: string;
  petName: string;
}) {
  useEffect(() => {
    void trackMetaCustomEvent("VetReport_LinkViewed", { reportId, petName });
  }, [reportId, petName]);

  return null;
}
