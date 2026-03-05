"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AlertCardProps = {
  level: "red" | "yellow" | "green";
  reason: string;
  actionable: string;
  isPremium: boolean;
  petName: string;
  source?: "daily_logs" | "weekly_checkin" | "combined";
};

export function AlertCard({ level, reason, actionable, isPremium, petName, source }: AlertCardProps) {
  // Free users see gated version if there's an alert
  if (!isPremium && level !== "green") {
    return (
      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="rounded-full bg-amber-100 p-3">
                <Shield className="h-6 w-6 text-amber-700" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-amber-900">
                  ⚠️ Pattern detected for {petName}
                </h3>
                <p className="mt-1 text-sm text-amber-800">
                  Upgrade to Pro to see health alerts when {petName}'s patterns change.
                </p>
              </div>
              <div className="rounded-lg bg-white/60 px-4 py-3 text-sm blur-[1.5px]">
                <p className="font-semibold text-slate-900">
                  {level === "red" ? "🔴 URGENT" : "🟡 WATCH CLOSELY"}
                </p>
                <p className="mt-1 text-slate-700">Pattern details available with Pro</p>
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
                <Button asChild className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/pricing?source=health-alert">
                    Enable Health Alerts — $9/mo
                  </Link>
                </Button>
                <p className="text-xs text-amber-700">
                  Catch problems 3 months before they become emergencies
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Premium users (or green alerts) see full details
  const bgColor =
    level === "red"
      ? "border-rose-300 bg-gradient-to-br from-rose-50 to-red-50"
      : level === "yellow"
      ? "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50"
      : "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50";

  const icon =
    level === "red" ? (
      <div className="rounded-full bg-rose-100 p-3">
        <AlertTriangle className="h-6 w-6 text-rose-700" />
      </div>
    ) : level === "yellow" ? (
      <div className="rounded-full bg-amber-100 p-3">
        <AlertTriangle className="h-6 w-6 text-amber-700" />
      </div>
    ) : (
      <div className="rounded-full bg-emerald-100 p-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-700" />
      </div>
    );

  const emoji = level === "red" ? "🔴" : level === "yellow" ? "🟡" : "🟢";

  return (
    <Card className={`border-2 shadow-lg ${bgColor}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{icon}</div>
          <div className="flex-1 space-y-2">
            <h3
              className={`text-lg font-bold ${
                level === "red"
                  ? "text-rose-900"
                  : level === "yellow"
                  ? "text-amber-900"
                  : "text-emerald-900"
              }`}
            >
              {emoji} {reason}
            </h3>
            <p
              className={`text-sm ${
                level === "red"
                  ? "text-rose-800"
                  : level === "yellow"
                  ? "text-amber-800"
                  : "text-emerald-800"
              }`}
            >
              {actionable}
            </p>
            {source === "weekly_checkin" && (
              <p
                className={`text-xs italic ${
                  level === "red"
                    ? "text-rose-700"
                    : level === "yellow"
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                Based on your weekly check-in response
              </p>
            )}
            {level !== "green" && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild size="sm" variant="default">
                  <Link href="/er-triage-for-dogs">Use Triage Tool</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/logs/new">Update Today's Log</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
