"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Download, Share2, Mail, Copy, Check, AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackCheckoutAndRedirect, trackMetaCustomEvent } from "@/lib/meta-events";
import type { VetReadyReport } from "@/app/api/pets/[id]/vet-report/route";

type ButtonState = "idle" | "loading" | "preview" | "sharing";

type VetReportExportButtonProps = {
  petId: string;
  petName: string;
  daysTracked?: number;
  isPremium: boolean;
};

// ── Severity helpers ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const labels = { high: "High", medium: "Moderate", low: "Low" };
  return (
    <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 uppercase tracking-wide ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}

function TrendBadge({ trend }: { trend: "improving" | "declining" | "stable" }) {
  if (trend === "improving") return <span className="text-green-600 text-xs font-medium">↑ Improving</span>;
  if (trend === "declining") return <span className="text-red-600 text-xs font-medium">↓ Declining</span>;
  return <span className="text-slate-500 text-xs">→ Stable</span>;
}

// ── Report preview panel (used in modal for premium) ──────────────────────────

function ReportPreview({ report }: { report: VetReadyReport }) {
  return (
    <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
      {/* Period + stats */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {report.period.start} — {report.period.end}
        </span>
        <span className="text-xs font-medium">
          {report.period.totalDaysLogged}/30 days logged&nbsp;
          <span className="text-muted-foreground">({report.period.logCompletionRate}%)</span>
        </span>
      </div>

      {/* Trends quick row */}
      <div className="grid grid-cols-4 gap-2">
        {(["energy", "appetite", "mobility", "mood"] as const).map((metric) => (
          <div key={metric} className="rounded-md border bg-background p-2 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5 capitalize">{metric}</div>
            <div className="font-semibold text-sm">
              {report.trends[metric].average > 0 ? report.trends[metric].average : "—"}
            </div>
            <div className="mt-0.5">
              <TrendBadge trend={report.trends[metric].trend} />
            </div>
          </div>
        ))}
      </div>

      {/* Concerns */}
      {report.concerns.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Flagged Concerns ({report.concerns.length})
          </h4>
          <div className="space-y-2">
            {report.concerns.map((concern, i) => (
              <div key={i} className="rounded-md border p-2.5 space-y-1">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={concern.severity} />
                  <span className="font-medium text-xs">{concern.category}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{concern.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discussion topics */}
      {report.discussionTopics.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Recommended Discussion Topics
          </h4>
          <ol className="space-y-1.5 list-none">
            {report.discussionTopics.map((topic, i) => (
              <li key={i} className="flex gap-2 text-xs text-foreground">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                <span className="leading-snug">{topic}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Check-ins + supplements compact row */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="rounded border p-2">
          <div className="font-medium text-foreground mb-0.5">Weekly Check-ins</div>
          {report.weeklyCheckIns.completed}/{report.weeklyCheckIns.totalPossible} completed
          {report.weeklyCheckIns.vetVisitsReported > 0 && (
            <div className="text-[10px] mt-0.5">
              {report.weeklyCheckIns.vetVisitsReported} vet visit(s) reported
            </div>
          )}
        </div>
        <div className="rounded border p-2">
          <div className="font-medium text-foreground mb-0.5">Medications / Supplements</div>
          {report.supplements.length === 0
            ? "None recorded"
            : report.supplements
                .slice(0, 3)
                .map((s) => s.name)
                .join(", ") + (report.supplements.length > 3 ? ` +${report.supplements.length - 3} more` : "")}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground border-t pt-2">
        This report reflects owner-recorded observations. It is not a veterinary diagnosis.
      </p>
    </div>
  );
}

// ── Blurred preview for free users ───────────────────────────────────────────

function FreePreview({ petName }: { petName: string }) {
  return (
    <div className="space-y-3 select-none">
      {/* Mock period bar */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
        <span className="text-xs text-muted-foreground">Jan 21, 2026 — Feb 20, 2026</span>
        <span className="text-xs font-medium">24/30 days logged (80%)</span>
      </div>

      {/* Mock trends (blurred) */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 blur-sm pointer-events-none" aria-hidden>
          {["Energy", "Appetite", "Mobility", "Mood"].map((m) => (
            <div key={m} className="rounded-md border bg-background p-2 text-center">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{m}</div>
              <div className="font-semibold text-sm">6.4</div>
              <div className="mt-0.5 text-xs text-amber-600">↓ Declining</div>
            </div>
          ))}
        </div>
      </div>

      {/* One visible concern teaser */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Flagged Concerns — 3 found for {petName}
        </h4>
        <div className="rounded-md border-2 border-dashed border-muted p-2.5 space-y-1 bg-muted/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">Upgrade to see flagged concerns</span>
          </div>
          <p className="text-xs text-muted-foreground/60 leading-snug blur-sm pointer-events-none" aria-hidden>
            Mobility scores declined 22% over the past 30 days — possible joint issue
          </p>
        </div>
      </div>

      {/* Blurred discussion topics */}
      <div className="relative">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Recommended Discussion Topics
        </h4>
        <div className="space-y-1.5 blur-sm pointer-events-none" aria-hidden>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="text-primary font-bold shrink-0">{i}.</span>
              <span className="bg-muted rounded h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function VetReportExportButton({
  petId,
  petName,
  daysTracked,
  isPremium,
}: VetReportExportButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [report, setReport] = useState<VetReadyReport | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  // Keep existing paywall pixel event
  useEffect(() => {
    if (showPaywall && !viewTracked && !isPremium) {
      void trackMetaCustomEvent("TierGate_VetExport", { source: "vet-export", petName });
      void trackMetaCustomEvent("TierGate_VetReport_Preview", { petName });
      setViewTracked(true);
    }
  }, [showPaywall, viewTracked, isPremium, petName]);

  const handleClick = useCallback(async () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    setButtonState("loading");
    try {
      const res = await fetch(`/api/pets/${petId}/vet-report?format=json`);
      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as VetReadyReport;
      setReport(data);
      setButtonState("preview");

      void trackMetaCustomEvent("VetReport_Generated", {
        petId,
        petName,
        concernCount: data.concerns.length,
        highSeverityCount: data.concerns.filter((c) => c.severity === "high").length,
      });
    } catch {
      setButtonState("idle");
    }
  }, [petId, petName, isPremium]);

  const handleDownloadPDF = useCallback(() => {
    window.open(`/api/pets/${petId}/vet-report`, "_blank", "noopener,noreferrer");
    void trackMetaCustomEvent("VetReport_PDF_Downloaded", { petId, petName });
  }, [petId, petName]);

  const handleShare = useCallback(async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    setButtonState("sharing");
    try {
      const res = await fetch(`/api/pets/${petId}/vet-report/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData: report }),
      });
      const data = (await res.json()) as { url: string };
      setShareUrl(data.url);
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      void trackMetaCustomEvent("VetReport_LinkShared", { petId, petName });
    } catch {
      // silently fail — user can still use the download
    } finally {
      setButtonState("preview");
    }
  }, [petId, petName, report, shareUrl]);

  const handleEmailToVet = useCallback(async () => {
    let link = shareUrl;
    if (!link && report) {
      try {
        const res = await fetch(`/api/pets/${petId}/vet-report/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportData: report }),
        });
        const data = (await res.json()) as { url: string };
        link = data.url;
        setShareUrl(link);
      } catch {
        link = `https://fursbliss.com`;
      }
    }

    const subject = `Health Summary: ${petName} — FursBliss 30-Day Report`;
    const body =
      `Hi,\n\nPlease find ${petName}'s 30-day health summary below, generated by FursBliss.\n\n` +
      (link ? `Full interactive report: ${link}\n\n` : "") +
      (report && report.concerns.length > 0
        ? `Flagged concerns (${report.concerns.length}):\n` +
          report.concerns
            .map((c) => `  [${c.severity.toUpperCase()}] ${c.category}: ${c.description}`)
            .join("\n") +
          "\n\n"
        : "") +
      (report && report.discussionTopics.length > 0
        ? `Recommended discussion topics:\n` +
          report.discussionTopics.map((t, i) => `  ${i + 1}. ${t}`).join("\n") +
          "\n\n"
        : "") +
      `Thank you,\n${petName}'s owner\n\n` +
      `— Report generated by FursBliss | www.fursbliss.com`;

    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  }, [petId, petName, report, shareUrl]);

  const isPreviewOpen = buttonState === "preview" || buttonState === "sharing";

  return (
    <>
      {/* Main trigger button */}
      <Button
        variant="outline"
        onClick={() => void handleClick()}
        disabled={buttonState === "loading"}
      >
        {buttonState === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing 30 days of health data...
          </>
        ) : (
          "Generate Vet Summary"
        )}
      </Button>

      {/* ── PREMIUM: Report Preview Modal ─────────────────────────────────────── */}
      {isPremium && report && (
        <Dialog open={isPreviewOpen} onOpenChange={(open) => !open && setButtonState("idle")}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                {petName}&apos;s Vet-Ready Health Summary
              </DialogTitle>
              <DialogDescription className="text-xs">
                {report.period.start} — {report.period.end} &middot;{" "}
                {report.concerns.length} concern{report.concerns.length !== 1 ? "s" : ""} flagged
              </DialogDescription>
            </DialogHeader>

            <ReportPreview report={report} />

            {/* Share URL confirmation */}
            {shareUrl && (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
                <Info className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate text-muted-foreground">{shareUrl}</span>
                <span className="text-green-600 font-medium shrink-0">Copied!</span>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                onClick={() => void handleDownloadPDF()}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleShare()}
                disabled={buttonState === "sharing"}
                className="gap-1.5"
              >
                {buttonState === "sharing" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied!" : shareUrl ? "Copy Link" : "Share Link"}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => void handleEmailToVet()}
                className="gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                Email to Vet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── FREE USER: Enhanced Paywall Modal with blurred preview ─────────────── */}
      {!isPremium && (
        <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{petName}&apos;s vet report is ready to unlock.</DialogTitle>
              <DialogDescription>
                Premium members get a 1-page clinical summary with trend analysis, flagged
                concerns, and vet discussion topics.
              </DialogDescription>
            </DialogHeader>

            <FreePreview petName={petName} />

            <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 text-sm space-y-0.5">
              <p className="font-semibold text-foreground">What&apos;s inside your full report:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 mt-1 list-none">
                <li>✓ 30-day trend analysis (energy, appetite, mobility, mood)</li>
                <li>✓ Auto-detected flagged concerns with severity ratings</li>
                <li>✓ Vet discussion topics with breed-specific context</li>
                <li>✓ Shareable link to send directly to your vet</li>
                <li>✓ Downloadable 1-page PDF</li>
              </ul>
              <p className="text-xs font-medium text-foreground mt-1.5">$9/month. Cancel anytime.</p>
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button
                className="w-full"
                onClick={async () => {
                  const href = `/api/stripe/checkout?plan=monthly&source=vet-report&returnTo=${encodeURIComponent(
                    `/pets/${petId}?upgraded=true`
                  )}&cancelTo=${encodeURIComponent(`/pets/${petId}`)}`;
                  await trackCheckoutAndRedirect(href, {
                    source: "vet_report",
                    value: 9,
                    contentName: "FursBliss Premium Monthly",
                  });
                }}
              >
                Unlock Full Report — $9/mo
              </Button>

              <div className="text-center">
                <a
                  className="text-xs text-muted-foreground underline"
                  href={`/api/stripe/checkout?plan=yearly&source=vet-report-yearly&returnTo=${encodeURIComponent(
                    `/pets/${petId}?upgraded=true`
                  )}&cancelTo=${encodeURIComponent(`/pets/${petId}`)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const href = e.currentTarget.getAttribute("href");
                    if (href) void trackCheckoutAndRedirect(href, {
                      source: "vet_report_yearly",
                      value: 59,
                      contentName: "FursBliss Premium Yearly",
                    });
                  }}
                >
                  Prefer yearly? Save 45% with annual billing
                </a>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setShowPaywall(false)}>
                Maybe later
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
