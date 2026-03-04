"use client";

import Link from "next/link";
import { ShieldAlert, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type HealthFlag = {
  id: string;
  type: "red" | "yellow" | "green";
  title: string;
  description: string;
};

type MissedAlertsPreviewProps = {
  petName: string;
  scoreChange: number;
  flags: HealthFlag[];
  daysTracked: number;
};

export function MissedAlertsPreview({
  petName,
  scoreChange,
  flags,
  daysTracked,
}: MissedAlertsPreviewProps) {
  const redFlags = flags.filter((f) => f.type === "red");
  const yellowFlags = flags.filter((f) => f.type === "yellow");

  // Only show if there are meaningful alerts
  const hasAlerts = redFlags.length > 0 || yellowFlags.length > 0 || Math.abs(scoreChange) >= 10;

  if (!hasAlerts || daysTracked < 7) return null;

  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="rounded-full bg-amber-100 p-3">
              <ShieldAlert className="h-6 w-6 text-amber-700" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-amber-900">
                You missed important health alerts for {petName}
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                Premium members get daily emails when their dog's health metrics shift. Here's
                what you would have been notified about:
              </p>
            </div>

            {/* Preview of missed alerts */}
            <div className="space-y-2">
              {/* Score change */}
              {Math.abs(scoreChange) >= 10 && (
                <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-slate-900">
                    Health score {scoreChange > 0 ? "improved" : "declined"} by{" "}
                    {Math.abs(scoreChange)} points
                  </span>
                </div>
              )}

              {/* Red flags */}
              {redFlags.slice(0, 2).map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-start gap-2 rounded-lg bg-red-50/80 px-3 py-2 text-sm"
                >
                  <span className="text-base">🔴</span>
                  <div className="flex-1 blur-[1.2px]">
                    <span className="font-medium text-red-900">{flag.title}</span>
                    <p className="mt-0.5 text-xs text-red-800 line-clamp-1">
                      {flag.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Yellow flags */}
              {yellowFlags.slice(0, 1).map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-start gap-2 rounded-lg bg-yellow-50/80 px-3 py-2 text-sm"
                >
                  <span className="text-base">⚠️</span>
                  <div className="flex-1 blur-[1.2px]">
                    <span className="font-medium text-yellow-900">{flag.title}</span>
                    <p className="mt-0.5 text-xs text-yellow-800 line-clamp-1">
                      {flag.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* More alerts indicator */}
              {flags.length > 3 && (
                <div className="rounded-lg bg-white/60 px-3 py-2 text-center text-sm text-amber-800 blur-sm">
                  + {flags.length - 3} more alerts
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/pricing?source=missed-alerts">
                  Enable Health Alerts — $9/mo
                </Link>
              </Button>
              <p className="text-xs text-amber-700">
                Get daily emails when {petName}'s health patterns shift
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
