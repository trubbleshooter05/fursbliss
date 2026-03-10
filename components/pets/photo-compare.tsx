"use client";

import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackMetaCustomEvent } from "@/lib/meta-events";
import type { PetPhotoRecord } from "@/components/pets/photo-timeline";

type Props = {
  photos: PetPhotoRecord[];
  onClose: () => void;
  petId: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  lump: "Lump / Mass",
  skin: "Skin / Coat",
  eye: "Eye",
  teeth: "Teeth / Mouth",
  wound: "Wound / Injury",
  mobility: "Mobility / Gait",
  other: "Other",
};

export function PhotoCompare({ photos, onClose, petId }: Props) {
  // Show max 4, sorted oldest → newest for progression view
  const sorted = [...photos]
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime())
    .slice(0, 4);

  const category = sorted[0]?.category ?? "";
  const bodyArea = sorted[0]?.bodyArea ?? "";

  async function handleShareWithVet() {
    void trackMetaCustomEvent("PhotoTimeline_ShareVet", {
      petId,
      category,
      photoCount: sorted.length,
    });
    // Copy page URL with photo IDs as share intent
    const ids = sorted.map((p) => p.id).join(",");
    const url = `${window.location.origin}/pets/${petId}?compare=${ids}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Comparison link copied to clipboard! Share it with your vet.");
    } catch {
      prompt("Copy this link to share with your vet:", url);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold text-slate-900">
              {CATEGORY_LABELS[category] ?? category} Progression
            </h3>
            {bodyArea && (
              <p className="text-sm text-muted-foreground capitalize">
                {bodyArea.replace(/_/g, " ")} · {sorted.length} photos over time
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Photo grid — horizontal scroll on mobile */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {sorted.map((photo, i) => (
            <div key={photo.id} className="flex-shrink-0 space-y-2" style={{ width: "calc(25% - 12px)", minWidth: 160 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.imageUrl}
                alt={`Photo ${i + 1}`}
                className="aspect-square w-full rounded-xl object-cover"
              />
              <div className="text-center">
                <p className="text-xs font-medium text-slate-800">
                  {format(parseISO(photo.takenAt), "MMM d, yyyy")}
                </p>
                {i === 0 && sorted.length > 1 && (
                  <p className="text-xs text-muted-foreground">Earliest</p>
                )}
                {i === sorted.length - 1 && sorted.length > 1 && (
                  <p className="text-xs text-muted-foreground">Most Recent</p>
                )}
                {photo.notes && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{photo.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {sorted.length < photos.length && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Showing {sorted.length} of {photos.length} photos
          </p>
        )}

        {/* Footer */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => void handleShareWithVet()}>Share with Vet</Button>
        </div>
      </div>
    </div>
  );
}
