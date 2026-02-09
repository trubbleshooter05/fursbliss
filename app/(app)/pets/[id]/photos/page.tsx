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
  createdAt: string;
};

export default function PhotoProgressPage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id;
  const [photoUrl, setPhotoUrl] = useState("");
  const [category, setCategory] = useState("general");
  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState<PhotoLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    }
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
        <CardContent className="grid gap-4 md:grid-cols-2">
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No photos yet.</p>
          ) : (
            photos.map((photo) => (
              <div key={photo.id} className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
                <img src={photo.imageUrl} alt="Pet" className="h-48 w-full rounded-xl object-cover" />
                <p className="text-xs text-muted-foreground">
                  {new Date(photo.createdAt).toDateString()} • {photo.category ?? "general"}
                </p>
                {photo.caption && (
                  <p className="text-sm text-slate-700">{photo.caption}</p>
                )}
                {photo.aiAnalysis ? (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {photo.aiAnalysis}
                  </p>
                ) : (
                  <Button variant="outline" onClick={() => runAnalysis(photo.id)}>
                    Run AI analysis
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
