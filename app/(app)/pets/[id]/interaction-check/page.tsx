"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function InteractionCheckPage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id;
  const [stack, setStack] = useState("");
  const [addItem, setAddItem] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!petId) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/ai/interaction-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          stack,
          addItem,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to check interactions.");
      }

      setResult(data.response);
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
          Supplement interaction checker
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-900">
          Check your pet&apos;s stack
        </h1>
        <p className="text-muted-foreground">
          Paste current supplements and medications, and optionally add a new item.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current stack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Omega-3 fish oil 1000mg daily; Glucosamine 500mg daily; Carprofen 25mg daily"
            rows={5}
            value={stack}
            onChange={(event) => setStack(event.target.value)}
          />
          <Textarea
            placeholder="Optional: Add a new item to check"
            rows={2}
            value={addItem}
            onChange={(event) => setAddItem(event.target.value)}
          />
          <Button onClick={onSubmit} disabled={isLoading || !stack.trim()}>
            {isLoading ? "Checking..." : "Run interaction check"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-slate-700">
            {result}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
