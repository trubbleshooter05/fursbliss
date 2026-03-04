"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trackMetaCustomEvent } from "@/lib/meta-events";

type HealthLog = {
  id: string;
  date: Date;
  energyLevel: number;
  mood?: string | null;
  notes?: string | null;
};

type HealthLogHistoryProps = {
  logs: HealthLog[];
  isPremium: boolean;
  petName: string;
};

export function HealthLogHistory({ logs, isPremium, petName }: HealthLogHistoryProps) {
  const [gateHitTracked, setGateHitTracked] = useState(false);
  const lockedSectionRef = useRef<HTMLDivElement>(null);

  // Calculate cutoff date (30 days ago)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  // Separate visible and locked logs
  const visibleLogs = isPremium
    ? logs
    : logs.filter((log) => log.date >= cutoffDate);
  const lockedLogs = isPremium
    ? []
    : logs.filter((log) => log.date < cutoffDate);

  const hasLockedContent = lockedLogs.length > 0;

  // Track when user scrolls to locked section
  useEffect(() => {
    if (!hasLockedContent || gateHitTracked || isPremium) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !gateHitTracked) {
            void trackMetaCustomEvent("HistoryGateHit", {
              pet_name: petName,
              locked_entries: lockedLogs.length,
            });
            setGateHitTracked(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (lockedSectionRef.current) {
      observer.observe(lockedSectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasLockedContent, gateHitTracked, isPremium, petName, lockedLogs.length]);

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">
        No logs yet. Capture the first health check today.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Energy</TableHead>
            <TableHead>Mood</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Visible logs (last 30 days for free, all for premium) */}
          {visibleLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{format(log.date, "MMM d, yyyy")}</TableCell>
              <TableCell>{log.energyLevel}</TableCell>
              <TableCell>{log.mood ?? "—"}</TableCell>
              <TableCell className="max-w-[220px] truncate">
                {log.notes ?? "—"}
              </TableCell>
            </TableRow>
          ))}

          {/* Locked logs (only for free users) */}
          {hasLockedContent && !isPremium ? (
            <>
              {lockedLogs.slice(0, 3).map((log) => (
                <TableRow
                  key={log.id}
                  className="relative cursor-not-allowed opacity-40"
                >
                  <TableCell className="blur-sm">{format(log.date, "MMM d, yyyy")}</TableCell>
                  <TableCell className="blur-sm">{log.energyLevel}</TableCell>
                  <TableCell className="blur-sm">{log.mood ?? "—"}</TableCell>
                  <TableCell className="max-w-[220px] truncate blur-sm">
                    {log.notes ?? "—"}
                  </TableCell>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TableRow>
              ))}
              {lockedLogs.length > 3 ? (
                <TableRow className="relative cursor-not-allowed opacity-40">
                  <TableCell colSpan={4} className="text-center blur-sm">
                    +{lockedLogs.length - 3} more entries locked
                  </TableCell>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TableRow>
              ) : null}
            </>
          ) : null}
        </TableBody>
      </Table>

      {/* Upgrade CTA below locked content */}
      {hasLockedContent && !isPremium ? (
        <div
          ref={lockedSectionRef}
          className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center"
        >
          <div className="mx-auto max-w-md space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-amber-700" />
              <h3 className="text-lg font-semibold text-amber-900">
                Unlock {petName}'s Full Health Timeline
              </h3>
            </div>
            <p className="text-sm text-amber-800">
              You have <span className="font-semibold">{lockedLogs.length} older entries</span>{" "}
              from before {format(cutoffDate, "MMM d, yyyy")}. See trends over months, not just
              weeks — upgrade to premium for {petName}'s complete health history.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/pricing?source=history-gate">
                  Unlock Full History — $9/mo
                </Link>
              </Button>
              <Button asChild variant="link" className="text-amber-700">
                <Link href="/pricing?source=history-gate">
                  Or save 45% with yearly billing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
