"use client";

import { useState, useCallback, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Trash2, ZoomIn, GitCompare, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhotoCompare } from "@/components/pets/photo-compare";
import { PhotoUploadButton } from "@/components/pets/photo-upload-button";
import { trackMetaCustomEvent } from "@/lib/meta-events";

export type PetPhotoRecord = {
  id: string;
  imageUrl: string;
  category: string;
  bodyArea: string | null;
  notes: string | null;
  takenAt: string;
  createdAt: string;
};

type Props = {
  petId: string;
  petName: string;
  isPremium: boolean;
  initialPhotos: PetPhotoRecord[];
  initialTotal: number;
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

const CATEGORY_COLORS: Record<string, string> = {
  lump: "bg-red-100 text-red-700",
  skin: "bg-orange-100 text-orange-700",
  eye: "bg-blue-100 text-blue-700",
  teeth: "bg-yellow-100 text-yellow-700",
  wound: "bg-rose-100 text-rose-700",
  mobility: "bg-purple-100 text-purple-700",
  other: "bg-slate-100 text-slate-700",
};

const FREE_LIMIT = 3;

export function PhotoTimeline({ petId, petName, isPremium, initialPhotos, initialTotal }: Props) {
  const [photos, setPhotos] = useState<PetPhotoRecord[]>(initialPhotos);
  const [total, setTotal] = useState(initialTotal);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxPhoto, setLightboxPhoto] = useState<PetPhotoRecord | null>(null);
  const [comparePhotos, setComparePhotos] = useState<PetPhotoRecord[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    const res = await fetch(`/api/pets/${petId}/photos?${params.toString()}`);
    if (res.ok) {
      const data = await res.json() as { photos: PetPhotoRecord[]; total: number };
      setPhotos(data.photos);
      setTotal(data.total);
    }
  }, [petId, activeCategory]);

  useEffect(() => {
    void fetchPhotos();
  }, [fetchPhotos]);

  async function handleDelete(photoId: string) {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setDeletingId(photoId);
    await fetch(`/api/pets/${petId}/photos/${photoId}`, { method: "DELETE" });
    setDeletingId(null);
    void fetchPhotos();
  }

  // Group by month for timeline display
  const grouped = photos.reduce<Record<string, PetPhotoRecord[]>>((acc, photo) => {
    const key = format(parseISO(photo.takenAt), "MMMM yyyy");
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});

  // Find groups that can be compared (same category; bodyArea helps but not required)
  function getComparableGroup(photo: PetPhotoRecord): PetPhotoRecord[] | null {
    const sameCategory = photos.filter((p) => p.category === photo.category);
    if (sameCategory.length < 2) return null;
    // If body area is set, prefer grouping by category + bodyArea for tighter comparison
    if (photo.bodyArea) {
      const sameBodyArea = sameCategory.filter((p) => p.bodyArea === photo.bodyArea);
      if (sameBodyArea.length >= 2) return sameBodyArea;
    }
    return sameCategory;
  }

  const lockedCount = Math.max(0, total - FREE_LIMIT);
  const categories = ["all", ...Array.from(new Set(initialPhotos.map((p) => p.category)))];

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-slate-900">Photo Timeline</h3>
        <PhotoUploadButton
          petId={petId}
          petName={petName}
          isPremium={isPremium}
          onUploaded={() => void fetchPhotos()}
        />
      </div>

      {/* Category filter */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "All" : (CATEGORY_LABELS[cat] ?? cat)}
            </button>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-muted-foreground">
          <p className="mb-2 text-3xl">📷</p>
          <p>No photos yet. Tap <strong>Add Photo</strong> to start your visual health record.</p>
        </div>
      )}

      {/* Timeline grouped by month */}
      {Object.entries(grouped).map(([month, monthPhotos]) => (
        <div key={month} className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{month}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {monthPhotos.map((photo) => {
              const comparableGroup = getComparableGroup(photo);
              return (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative cursor-zoom-in"
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.imageUrl}
                      alt={`${CATEGORY_LABELS[photo.category] ?? photo.category} — ${format(parseISO(photo.takenAt), "MMM d")}`}
                      className="aspect-square h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                      <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="p-2 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[photo.category] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {CATEGORY_LABELS[photo.category] ?? photo.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(photo.takenAt), "MMM d")}
                      </span>
                    </div>
                    {photo.notes && (
                      <p className="text-xs text-slate-600 line-clamp-2">{photo.notes}</p>
                    )}
                    <div className="flex items-center gap-1 pt-0.5">
                      {comparableGroup && (
                        <button
                          onClick={() => {
                            void trackMetaCustomEvent("PhotoTimeline_Compare", { petId, category: photo.category });
                            setComparePhotos(comparableGroup);
                          }}
                          title="Compare over time"
                          className="flex items-center gap-1 rounded text-xs text-blue-600 hover:text-blue-800"
                        >
                          <GitCompare className="h-3 w-3" />
                          Compare
                        </button>
                      )}
                      <button
                        onClick={() => void handleDelete(photo.id)}
                        disabled={deletingId === photo.id}
                        title="Delete photo"
                        className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Free tier gate — blurred placeholders */}
      {!isPremium && lockedCount > 0 && (
        <div className="relative rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-6 text-center">
          <Lock className="mx-auto mb-2 h-6 w-6 text-amber-500" />
          <p className="text-sm font-semibold text-amber-800">
            {lockedCount} more photo{lockedCount !== 1 ? "s" : ""} locked
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Free accounts keep the 3 most recent photos. Upgrade to see your full visual history.
          </p>
          <Button
            size="sm"
            className="mt-3"
            onClick={() => {
              void trackMetaCustomEvent("TierGate_PhotoTimeline", { petId });
              window.location.href = "/pricing";
            }}
          >
            Unlock Full History — $9/mo
          </Button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-2xl overflow-auto rounded-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute right-3 top-3 rounded-full bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxPhoto.imageUrl}
              alt="Full size"
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {CATEGORY_LABELS[lightboxPhoto.category] ?? lightboxPhoto.category}
                </Badge>
                {lightboxPhoto.bodyArea && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {lightboxPhoto.bodyArea.replace(/_/g, " ")}
                  </Badge>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {format(parseISO(lightboxPhoto.takenAt), "MMMM d, yyyy")}
                </span>
              </div>
              {lightboxPhoto.notes && (
                <p className="text-sm text-slate-600">{lightboxPhoto.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compare modal */}
      {comparePhotos && (
        <PhotoCompare
          photos={comparePhotos}
          onClose={() => setComparePhotos(null)}
          petId={petId}
        />
      )}
    </div>
  );
}
