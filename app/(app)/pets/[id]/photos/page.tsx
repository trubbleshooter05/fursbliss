"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PhotoUploader } from "@/components/pets/photo-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type PhotoLog = {
  id: string;
  imageUrl: string;
  category?: string | null;
  caption?: string | null;
  aiAnalysis?: string | null;
  analysisHistoryCount?: number;
  createdAt: string;
};

export default function PhotoProgressPage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id;
  const [photoUrl, setPhotoUrl] = useState("");
  const [category, setCategory] = useState("general");
  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState<PhotoLog[]>([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [analyzingPhotoId, setAnalyzingPhotoId] = useState<string | null>(null);

  const loadPhotos = async () => {
    if (!petId) return;
    const response = await fetch(`/api/photos?petId=${petId}`);
    if (response.ok) {
      const data = await response.json();
      setPhotos(data);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [petId]);

  const onSave = async () => {
    if (!petId || !photoUrl) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          imageUrl: photoUrl,
          category,
          caption: caption || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save photo.");
      }
      setPhotoUrl("");
      setCaption("");
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const runAnalysis = async (photoLogId: string) => {
    setError(null);
    setAnalyzingPhotoId(photoLogId);
    try {
      const response = await fetch("/api/ai/photo-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoLogId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to analyze photo.");
      }
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAnalyzingPhotoId(null);
    }
  };

  const visiblePhotos = photos.filter((photo) => {
    if (filterCategory === "all") return true;
    return (photo.category ?? "general").toLowerCase() === filterCategory.toLowerCase();
  });

  const categoryOptions = Array.from(
    new Set(photos.map((photo) => (photo.category ?? "general").toLowerCase()))
  );

  const onCopyCard = async (photo: PhotoLog) => {
    const text = [
      "FursBliss Progress Card",
      `Date: ${new Date(photo.createdAt).toDateString()}`,
      `Category: ${photo.category ?? "general"}`,
      photo.caption ? `Caption: ${photo.caption}` : "",
      photo.aiAnalysis ? `AI Notes: ${photo.aiAnalysis}` : "",
      "Reminder: This is not veterinary diagnosis. Confirm concerns with your vet.",
    ]
      .filter(Boolean)
      .join("\n");
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
          Photo progress
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Photo timeline</h1>
        <p className="text-muted-foreground">
          Upload photos to track visible changes over time.
        </p>
        <p className="text-xs text-muted-foreground">
          AI photo observations are not medical diagnosis and should be reviewed by a
          veterinarian.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a new photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />
          <Input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Category (coat, mobility, dental, eyes, weight, general)"
          />
          <Input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Caption"
          />
          <Button onClick={onSave} disabled={isSaving || !photoUrl}>
            {isSaving ? "Saving..." : "Save photo"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photo timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filterCategory === "all" ? "default" : "outline"}
              onClick={() => setFilterCategory("all")}
            >
              All
            </Button>
            {categoryOptions.map((option) => (
              <Button
                key={option}
                size="sm"
                variant={filterCategory === option ? "default" : "outline"}
                onClick={() => setFilterCategory(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
          {visiblePhotos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No photos yet.</p>
          ) : (
            visiblePhotos.map((photo) => (
              <div key={photo.id} className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
                <img src={photo.imageUrl} alt="Pet" className="h-48 w-full rounded-xl object-cover" />
                <p className="text-xs text-muted-foreground">
                  {new Date(photo.createdAt).toDateString()} • {photo.category ?? "general"}
                </p>
                {photo.caption && (
                  <p className="text-sm text-slate-700">{photo.caption}</p>
                )}
                {photo.aiAnalysis ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {photo.aiAnalysis}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Analysis runs: {photo.analysisHistoryCount ?? 1}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => onCopyCard(photo)}>
                        Copy progress card
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => runAnalysis(photo.id)}
                        disabled={analyzingPhotoId === photo.id}
                      >
                        {analyzingPhotoId === photo.id ? "Re-analyzing..." : "Re-run AI"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => runAnalysis(photo.id)}
                    disabled={analyzingPhotoId === photo.id}
                  >
                    {analyzingPhotoId === photo.id ? "Analyzing..." : "Run AI analysis"}
                  </Button>
                )}
              </div>
            ))
          )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
