"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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

type VetReportExportButtonProps = {
  petId: string;
  petName: string;
  daysTracked: number;
  isPremium: boolean;
};

export function VetReportExportButton({
  petId,
  petName,
  daysTracked,
  isPremium,
}: VetReportExportButtonProps) {
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleExportClick = async () => {
    if (isPremium) {
      window.open(`/api/exports/pet-report?petId=${petId}`, "_blank", "noopener,noreferrer");
      return;
    }

    setIsLoadingPreview(true);
    window.setTimeout(async () => {
      setIsLoadingPreview(false);
      setShowPaywall(true);
      await trackMetaCustomEvent("TriedVetExport", { petName });
    }, 1200);
  };

  return (
    <>
      <Button variant="outline" onClick={() => void handleExportClick()} disabled={isLoadingPreview}>
        {isLoadingPreview ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Preparing report...
          </>
        ) : (
          "Export Vet Report"
        )}
      </Button>

      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your vet report for {petName} is ready to download.</DialogTitle>
            <DialogDescription>
              Vet-ready health reports are a Premium feature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Your vet will see: {daysTracked} days of tracking data, health trends, AI recommendations,
              and breed-specific risks.
            </p>
            <p className="font-medium text-foreground">$9/month. Cancel anytime.</p>
            <p className="text-xs">
              Prefer yearly?{" "}
              <a
                className="underline"
                href={`/api/stripe/checkout?plan=yearly&source=vet-export-yearly&returnTo=${encodeURIComponent(
                  `/pets/${petId}?upgraded=true`
                )}&cancelTo=${encodeURIComponent(`/pets/${petId}`)}`}
                onClick={(event) => {
                  event.preventDefault();
                  const href = event.currentTarget.getAttribute("href");
                  if (!href) return;
                  void trackCheckoutAndRedirect(href, {
                    source: "vet_export_yearly",
                    value: 59,
                    contentName: "FursBliss Premium Yearly",
                  });
                }}
              >
                Save 45% with annual billing
              </a>
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                const href = `/api/stripe/checkout?plan=monthly&source=vet-export&returnTo=${encodeURIComponent(
                  `/pets/${petId}?upgraded=true`
                )}&cancelTo=${encodeURIComponent(`/pets/${petId}`)}`;
                await trackCheckoutAndRedirect(href, {
                  source: "vet_export",
                  value: 9,
                  contentName: "FursBliss Premium Monthly",
                });
              }}
            >
              Upgrade to Download — $9/mo
            </Button>
            <Button variant="ghost" onClick={() => setShowPaywall(false)}>
              Maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
