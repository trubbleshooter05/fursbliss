"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Stethoscope } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-events";

type AlertRow = {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  message?: string;
  recommendation?: string;
  metric?: string | null;
  trendData?: unknown;
  read: boolean;
  createdAt: string;
  locked?: boolean;
};

type ApiResponse =
  | { isPremium: true; alerts: AlertRow[] }
  | {
      isPremium: false;
      alerts: Array<{
        id: string;
        alertType: string;
        severity: string;
        title: string;
        read: boolean;
        createdAt: string;
        locked: true;
      }>;
    };

const severityStyles: Record<string, string> = {
  info: "bg-sky-100 text-sky-900 border-sky-200",
  warning: "bg-amber-100 text-amber-950 border-amber-200",
  urgent: "bg-red-100 text-red-950 border-red-200",
};

export function HealthAlertsPanel({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AlertRow | null>(null);
  const [lockedViewTracked, setLockedViewTracked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pets/${petId}/alerts`);
      if (!res.ok) throw new Error("Failed to load alerts");
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data || data.isPremium || lockedViewTracked) return;
    const hasLocked = data.alerts.some((a) => "locked" in a && a.locked);
    if (!hasLocked) return;
    void trackMetaEvent("ViewContent", {
      content_name: "health_alert_locked",
      content_category: "health_alerts",
      pet_id: petId,
    });
    void trackMetaCustomEvent("HealthAlert_Locked_View", { petId, petName });
    setLockedViewTracked(true);
  }, [data, lockedViewTracked, petId, petName]);

  const markRead = async (alertId: string) => {
    await fetch(`/api/pets/${petId}/alerts/${alertId}/read`, { method: "POST" });
    void load();
  };

  const chartFromTrend = (trendData: unknown) => {
    const t = trendData as { current7day?: number; previous7day?: number } | null;
    if (!t?.current7day && !t?.previous7day) return null;
    return [
      { label: "Prev 7d", value: t.previous7day ?? 0 },
      { label: "Last 7d", value: t.current7day ?? 0 },
    ];
  };

  return (
    <Card id="health-alerts" className="border-2 border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-lg">Health insights</CardTitle>
        {data && !data.isPremium && data.alerts.length > 0 ? (
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" />
            Preview
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading alerts…
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !data || data.alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No proactive alerts yet. Keep logging — we’ll surface trends when there’s enough data.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.alerts.map((a) => {
              const locked = !data.isPremium && "locked" in a && a.locked;
              return (
                <li
                  key={a.id}
                  className={`rounded-xl border p-4 ${severityStyles[a.severity] ?? "bg-muted/40 border-border"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(a.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {a.severity}
                    </Badge>
                  </div>
                  {locked ? (
                    <div className="mt-3 rounded-lg bg-background/80 p-4 text-sm">
                      <p className="font-medium text-foreground">🔒 Unlock full insights</p>
                      <p className="mt-1 text-muted-foreground">
                        See what’s causing the change, breed-specific context, and vet-ready recommendations.
                      </p>
                      <Button className="mt-3 w-full sm:w-auto" asChild>
                        <Link
                          href="/pricing"
                          onClick={() => {
                            void trackMetaEvent("InitiateCheckout", {
                              content_name: "health_alerts_unlock",
                              content_category: "subscription",
                            });
                            void trackMetaCustomEvent("HealthAlert_Upgrade_Click", { petId, petName });
                          }}
                        >
                          Start Premium — view recommendations
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-foreground/90">{(a as AlertRow).message}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelected(a as AlertRow);
                            void markRead(a.id);
                          }}
                        >
                          Details
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/api/pets/${petId}/vet-report?format=pdf`}>
                            <Stethoscope className="mr-1 h-3.5 w-3.5" />
                            Vet report
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">{selected.message}</p>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="font-medium text-foreground">Recommended</p>
                <p className="mt-1">{selected.recommendation}</p>
              </div>
              {chartFromTrend(selected.trendData) ? (
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartFromTrend(selected.trendData)!}>
                      <XAxis dataKey="label" />
                      <YAxis domain={[0, "auto"]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
