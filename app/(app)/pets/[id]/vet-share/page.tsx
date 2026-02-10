"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type ShareLink = {
  id: string;
  url: string;
  expiresAt: string;
  createdAt: string;
  viewCount: number;
  isExpired: boolean;
  vetComment?: string | null;
};

export default function VetSharePage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id;
  const [origin, setOrigin] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isRevokingId, setIsRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLinks = async () => {
    if (!petId) return;
    setIsLoadingLinks(true);
    try {
      const response = await fetch(`/api/reports/share-link?petId=${petId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load links.");
      }
      setLinks(Array.isArray(data.links) ? data.links : []);
    } catch {
      setLinks([]);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  useEffect(() => {
    setOrigin(window.location.origin);
    loadLinks();
  }, [petId]);

  const onGenerate = async () => {
    if (!petId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reports/share-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          expiresInDays: Number(expiresInDays),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to create link.");
      }
      setShareUrl(origin ? `${origin}${data.url}` : data.url);
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRevoke = async (linkId: string) => {
    setIsRevokingId(linkId);
    setError(null);
    try {
      const response = await fetch("/api/reports/share-link", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to revoke link.");
      }
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsRevokingId(null);
    }
  };

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
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
          <Input
            value={expiresInDays}
            onChange={(event) => setExpiresInDays(event.target.value)}
            placeholder="Expires in days (e.g. 30)"
          />
          <Button onClick={onGenerate} disabled={isLoading}>
            {isLoading ? "Generating..." : "Create link"}
          </Button>
          {shareUrl && (
            <div className="space-y-2">
              <Input readOnly value={shareUrl} />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyLink(shareUrl)}
                >
                  Copy
                </Button>
                <Button variant="outline" asChild>
                  <a href={shareUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Link expiry and access are fully controlled by you.
              </p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingLinks ? (
            <p className="text-sm text-muted-foreground">Loading links...</p>
          ) : links.length === 0 ? (
            <p className="text-sm text-muted-foreground">No links yet.</p>
          ) : (
            links.map((link) => {
              const fullUrl = origin ? `${origin}${link.url}` : link.url;
              return (
                <div
                  key={link.id}
                  className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(link.createdAt).toDateString()} • Expires{" "}
                    {new Date(link.expiresAt).toDateString()} • Views {link.viewCount}
                  </p>
                  <Input readOnly value={fullUrl} />
                  {link.vetComment && (
                    <p className="text-xs text-emerald-700">
                      Vet note available on this link.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyLink(fullUrl)}
                    >
                      Copy
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={fullUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </Button>
                    {!link.isExpired && (
                      <Button variant="outline" asChild>
                        <a href={`/api/exports/pet-report?petId=${petId}`} target="_blank" rel="noreferrer">
                          Export PDF
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => onRevoke(link.id)}
                      disabled={isRevokingId === link.id}
                    >
                      {isRevokingId === link.id ? "Revoking..." : "Revoke"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
