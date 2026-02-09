"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function VetSharePage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id;
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    if (!petId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reports/share-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to create link.");
      }
      setShareUrl(`${window.location.origin}${data.url}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
          Vet collaboration
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Share with your vet</h1>
        <p className="text-muted-foreground">
          Create a read-only link to share recent health data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate share link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={onGenerate} disabled={isLoading}>
            {isLoading ? "Generating..." : "Create link"}
          </Button>
          {shareUrl && (
            <div className="space-y-2">
              <Input readOnly value={shareUrl} />
              <p className="text-xs text-muted-foreground">
                Link expires in 30 days.
              </p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
