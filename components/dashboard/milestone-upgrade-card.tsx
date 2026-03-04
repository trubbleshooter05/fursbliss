"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackCheckoutAndRedirect, trackMetaCustomEvent } from "@/lib/meta-events";

type MilestoneUpgradeCardProps = {
  dogName: string;
  breed: string;
  daysTracked: number;
  appetitePreview: string;
  energyPreview: string;
};

export function MilestoneUpgradeCard({
  dogName,
  breed,
  daysTracked,
  appetitePreview,
  energyPreview,
}: MilestoneUpgradeCardProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = `fb:milestone30:${dogName}`;
    if (window.localStorage.getItem(key) === "1") {
      return;
    }
    void trackMetaCustomEvent("Hit30DayMilestone", {
      petName: dogName,
      daysTracked,
    });
    window.localStorage.setItem(key, "1");
  }, [dogName, daysTracked]);

  if (dismissed) return null;

  return (
    <Card className="rounded-2xl border-indigo-200 bg-indigo-50/50">
      <CardHeader>
        <CardTitle>🎉 30 days of tracking {dogName}! Here&apos;s a preview of your monthly trend report...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-indigo-950/90">
        <div className="grid gap-2 rounded-xl border border-indigo-200 bg-white p-4">
          <p>Appetite: {appetitePreview}</p>
          <p>Energy: {energyPreview}</p>
          <p>Tracking consistency: {daysTracked} unique days logged</p>
        </div>
        <div className="space-y-1 rounded-xl border border-dashed border-indigo-300 bg-indigo-100/60 p-4">
          <p className="blur-[2px] select-none">🔒 Full 30-day analysis with actionable recommendations</p>
          <p className="blur-[2px] select-none">🔒 Breed-specific risk comparison for {breed}</p>
          <p className="blur-[2px] select-none">🔒 Downloadable vet-ready report</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              const href = `/api/stripe/checkout?plan=monthly&source=30-day-milestone&returnTo=${encodeURIComponent(
                "/dashboard?upgraded=true"
              )}&cancelTo=${encodeURIComponent("/dashboard")}`;
              await trackCheckoutAndRedirect(href, {
                source: "30_day_milestone",
                value: 9,
                contentName: "FursBliss Premium Monthly",
              });
            }}
          >
            Unlock Full Report — $9/mo
          </Button>
          <Button variant="ghost" onClick={() => setDismissed(true)}>
            Maybe later
          </Button>
        </div>
        <p className="text-xs text-indigo-900/80">
          Prefer yearly?{" "}
          <a
            className="underline"
            href={`/api/stripe/checkout?plan=yearly&source=30-day-milestone-yearly&returnTo=${encodeURIComponent(
              "/dashboard?upgraded=true"
            )}&cancelTo=${encodeURIComponent("/dashboard")}`}
            onClick={(event) => {
              event.preventDefault();
              const href = event.currentTarget.getAttribute("href");
              if (!href) return;
              void trackCheckoutAndRedirect(href, {
                source: "30_day_milestone_yearly",
                value: 59,
                contentName: "FursBliss Premium Yearly",
              });
            }}
          >
            Save 45% with annual billing
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
