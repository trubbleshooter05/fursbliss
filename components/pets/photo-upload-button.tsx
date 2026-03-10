"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackMetaCustomEvent } from "@/lib/meta-events";

type UploadState = "idle" | "uploading" | "success" | "error";

type Props = {
  petId: string;
  petName: string;
  isPremium: boolean;
  onUploaded?: () => void;
};

const CATEGORIES = [
  { value: "lump", label: "Lump / Mass" },
  { value: "skin", label: "Skin / Coat" },
  { value: "eye", label: "Eye" },
  { value: "teeth", label: "Teeth / Mouth" },
  { value: "wound", label: "Wound / Injury" },
  { value: "mobility", label: "Mobility / Gait" },
  { value: "other", label: "Other" },
];

const BODY_AREAS = [
  { value: "left_hip", label: "Left Hip" },
  { value: "right_hip", label: "Right Hip" },
  { value: "left_shoulder", label: "Left Shoulder" },
  { value: "right_shoulder", label: "Right Shoulder" },
  { value: "left_ear", label: "Left Ear" },
  { value: "right_ear", label: "Right Ear" },
  { value: "abdomen", label: "Abdomen" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "neck", label: "Neck" },
  { value: "tail", label: "Tail" },
  { value: "mouth", label: "Mouth" },
  { value: "left_paw", label: "Left Paw" },
  { value: "right_paw", label: "Right Paw" },
  { value: "other", label: "Other / General" },
];

const FREE_LIMIT_MSG =
  "You've reached the 3-photo limit for free accounts. Upgrade to Premium for unlimited photo storage.";

export function PhotoUploadButton({ petId, petName, isPremium, onUploaded }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [bodyArea, setBodyArea] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 10));
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(picked);
    setErrorMsg("");
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setCategory("");
    setBodyArea("");
    setNotes("");
    setTakenAt(new Date().toISOString().slice(0, 10));
    setUploadState("idle");
    setErrorMsg("");
    setLimitReached(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload() {
    if (!file || !category) return;
    setUploadState("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    if (bodyArea) formData.append("bodyArea", bodyArea);
    if (notes) formData.append("notes", notes);
    formData.append("takenAt", new Date(takenAt).toISOString());

    try {
      const res = await fetch(`/api/pets/${petId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (res.status === 403) {
        const data = await res.json() as { limitReached?: boolean; message?: string };
        setLimitReached(true);
        setErrorMsg(data.message ?? FREE_LIMIT_MSG);
        setUploadState("error");
        void trackMetaCustomEvent("TierGate_PhotoTimeline", { petId });
        return;
      }
      if (!res.ok) {
        const data = await res.json() as { message?: string };
        setErrorMsg(data.message ?? "Upload failed");
        setUploadState("error");
        return;
      }

      void trackMetaCustomEvent("PhotoTimeline_Upload", { category, petId });
      setUploadState("success");
      onUploaded?.();
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 1200);
    } catch {
      setErrorMsg("Upload failed. Please try again.");
      setUploadState("error");
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => { reset(); setOpen(true); }}
      >
        <Camera className="h-4 w-4" />
        Add Photo
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Photo for {petName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* File picker */}
            <div
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center hover:border-slate-400 hover:bg-slate-100 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded-lg object-contain"
                  />
                  <button
                    className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  >
                    <X className="h-3 w-3 text-slate-500" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">Tap to choose a photo</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP, HEIC · max 5 MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Category — required */}
            <div className="space-y-1">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="What does this photo show?" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Body area — optional */}
            <div className="space-y-1">
              <Label className="text-muted-foreground">Body Area <span className="text-xs">(optional)</span></Label>
              <Select value={bodyArea} onValueChange={setBodyArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Where on the body?" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_AREAS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label>Date Taken</Label>
              <Input
                type="date"
                value={takenAt}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setTakenAt(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-muted-foreground">Notes <span className="text-xs">(optional, max 200 chars)</span></Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                placeholder="Describe what you're seeing..."
                rows={2}
              />
              <p className="text-right text-xs text-muted-foreground">{notes.length}/200</p>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMsg}
                {limitReached && !isPremium && (
                  <a href="/pricing" className="ml-2 font-semibold underline">
                    Upgrade →
                  </a>
                )}
              </div>
            )}

            {/* Success */}
            {uploadState === "success" && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                ✓ Photo uploaded successfully!
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { reset(); setOpen(false); }}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleUpload()}
              disabled={!file || !category || uploadState === "uploading" || uploadState === "success"}
            >
              {uploadState === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Photo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
