import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LongevityPlanCardProps = {
  title: string;
  summary: string;
  freeLabel: string;
  freeValue: string;
  lockedItems: string[];
  premiumUnlocked: boolean;
};

export function LongevityPlanCard({
  title,
  summary,
  freeLabel,
  freeValue,
  lockedItems,
  premiumUnlocked,
}: LongevityPlanCardProps) {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="font-display text-2xl text-foreground">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-emerald-700">{freeLabel}</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{freeValue}</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-600">
              {premiumUnlocked ? "Premium unlocked" : "Premium"}
            </p>
            {!premiumUnlocked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">
                <Lock className="h-3 w-3" /> Premium
              </span>
            ) : null}
          </div>

          <ul className="space-y-2 text-sm text-slate-800">
            {lockedItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>

          {!premiumUnlocked ? (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backdropFilter: "blur(3px)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.7) 100%)",
              }}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
