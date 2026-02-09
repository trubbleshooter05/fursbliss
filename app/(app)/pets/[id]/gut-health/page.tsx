"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type GutLog = {
  id: string;
  date: string;
  stoolQuality: number;
  stoolNotes?: string | null;
  gasLevel?: number | null;
  vomiting: boolean;
  appetiteChange?: string | null;
};

export default function GutHealthPage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id;
  const [logs, setLogs] = useState<GutLog[]>([]);
  const [stoolQuality, setStoolQuality] = useState("3");
  const [gasLevel, setGasLevel] = useState("");
  const [vomiting, setVomiting] = useState(false);
  const [appetiteChange, setAppetiteChange] = useState("");
  const [stoolNotes, setStoolNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!petId) return;
    const response = await fetch(`/api/gut-health?petId=${petId}`);
    if (response.ok) {
      const data = await response.json();
      setLogs(data);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [petId]);

  const onSubmit = async () => {
    if (!petId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gut-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          stoolQuality: Number(stoolQuality),
          gasLevel: gasLevel ? Number(gasLevel) : undefined,
          vomiting,
          appetiteChange: appetiteChange || undefined,
          stoolNotes: stoolNotes || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save gut log.");
      }
      setStoolNotes("");
      setGasLevel("");
      setVomiting(false);
      setAppetiteChange("");
      await fetchLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge className="w-fit bg-emerald-500/10 text-emerald-600">Gut health</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Gut health log</h1>
        <p className="text-muted-foreground">
          Track stool quality, gas, and appetite changes over time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add today&apos;s log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            min={1}
            max={7}
            value={stoolQuality}
            onChange={(event) => setStoolQuality(event.target.value)}
            placeholder="Stool quality (1-7)"
          />
          <Input
            type="number"
            min={1}
            max={5}
            value={gasLevel}
            onChange={(event) => setGasLevel(event.target.value)}
            placeholder="Gas level (1-5)"
          />
          <Input
            value={appetiteChange}
            onChange={(event) => setAppetiteChange(event.target.value)}
            placeholder="Appetite change (normal/increased/decreased)"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={vomiting}
              onChange={(event) => setVomiting(event.target.checked)}
            />
            Vomiting today
          </label>
          <Textarea
            value={stoolNotes}
            onChange={(event) => setStoolNotes(event.target.value)}
            placeholder="Notes (color, mucus, etc.)"
          />
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save log"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {logs.length === 0 ? (
            <p>No gut health logs yet.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3"
              >
                <span>{new Date(log.date).toDateString()}</span>
                <span>Stool {log.stoolQuality}/7</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
