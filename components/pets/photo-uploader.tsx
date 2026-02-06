"use client";

import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getCroppedImage, type Area } from "@/lib/crop-image";

type PhotoUploaderProps = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
};

export function PhotoUploader({ value, onChange, label }: PhotoUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const onSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  const uploadCropped = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImage(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", new File([croppedBlob], "pet-photo.jpg", { type: "image/jpeg" }));
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Upload failed");
      }
      onChange(data.url);
      toast({
        title: "Photo uploaded",
        description: "Your pet photo is ready.",
      });
      setImageSrc(null);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-900">{label ?? "Photo"}</label>
      {value ? (
        <img src={value} alt="Pet" className="h-40 w-full rounded-xl object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-muted-foreground">
          No photo uploaded
        </div>
      )}
      <Button
        variant="outline"
        type="button"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload photo
      </Button>
      <Dialog open={!!imageSrc} onOpenChange={(open) => !open && setImageSrc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop photo</DialogTitle>
          </DialogHeader>
          <div className="relative h-72 w-full overflow-hidden rounded-xl bg-slate-900">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
          <DialogFooter>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-emerald-600">
              <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
              Choose different photo
            </label>
            <Button onClick={uploadCropped} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Save photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="hidden"
      />
    </div>
  );
}
