"use client";

import type { PatternAlert } from "@/lib/pattern-detection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Lock } from "lucide-react";
import { TierGatePrompt } from "@/components/upgrade/tier-gate-prompt";

type PatternAlertsCardProps = {
  alerts: PatternAlert[];
  isPremium: boolean;
  petName: string;
};

export function PatternAlertsCard({ alerts, isPremium, petName }: PatternAlertsCardProps) {
  // Free users see a blurred preview if there are alerts
  if (!isPremium && alerts.length > 0) {
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 opacity-60 blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              Pattern Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 2).map((alert, idx) => (
              <div key={idx} className="rounded-lg border border-amber-300 bg-white/60 p-3">
                <p className="text-sm font-semibold text-amber-900">{alert.symptom}</p>
                <p className="text-xs text-amber-700">
                  {alert.currentWeekCount}x this week (up from {alert.previousWeekCount}x)
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <TierGatePrompt
          type="pattern-detection"
          petName={petName}
          pattern={alerts[0].message}
        />
      </div>
    );
  }

  // Premium users see full alerts
  if (isPremium && alerts.length > 0) {
    return (
      <Card className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <TrendingUp className="h-5 w-5" />
            Behavior Patterns Detected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-amber-800">
            We&apos;ve noticed changes in frequency for these behaviors:
          </p>
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`rounded-lg border-2 p-3 ${
                alert.severity === "red"
                  ? "border-red-300 bg-red-50"
                  : "border-yellow-300 bg-yellow-50"
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={`mt-0.5 h-4 w-4 ${
                    alert.severity === "red" ? "text-red-600" : "text-yellow-600"
                  }`}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    Change: +{alert.changePercent}% from last week
                  </p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-amber-700">
            💡 Consider using the{" "}
            <a href="/er-triage-for-dogs" className="font-semibold underline">
              ER triage tool
            </a>{" "}
            if symptoms worsen or new ones appear.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No alerts or no data
  return null;
}
