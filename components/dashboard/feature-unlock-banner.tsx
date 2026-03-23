"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { isFeatureUnlockActive, getFeatureUnlockLabel } from "@/lib/feature-unlock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FeatureUnlockBannerProps = {
  isPremium: boolean;
};

export function FeatureUnlockBanner({ isPremium }: FeatureUnlockBannerProps) {
  if (isPremium || !isFeatureUnlockActive()) return null;

  const label = getFeatureUnlockLabel();
  if (!label) return null;

  return (
    <Card className="rounded-2xl border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <p className="font-medium text-amber-900">{label}</p>
        </div>
        <p className="text-sm text-amber-800/90">
          Try health alerts, vet reports, and full pattern detection today.
        </p>
        <Button asChild size="sm" variant="outline" className="border-amber-300 bg-white shrink-0">
          <Link href="/pricing">Upgrade to keep these features</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
