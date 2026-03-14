"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Mode = "pain_points" | "acquisition" | "revenue";

export function StartupAdvisorForm() {
  const [businessIdea, setBusinessIdea] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPrompt = async (mode: Mode) => {
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch("/api/startup-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, businessIdea }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }

      setOutput(data.output ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Startup Advisor</CardTitle>
        <p className="text-sm text-muted-foreground">
          Internal tool for strategic prompts. Uses OpenAI.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label
            htmlFor="businessIdea"
            className="text-sm font-medium text-foreground"
          >
            Business idea (optional)
          </label>
          <Textarea
            id="businessIdea"
            placeholder="e.g. Dog health tracking app for senior dogs preparing for LOY-002"
            value={businessIdea}
            onChange={(e) => setBusinessIdea(e.target.value)}
            rows={3}
            className="mt-1.5 resize-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave blank to use FursBliss as the default.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => runPrompt("pain_points")}
            disabled={loading}
          >
            Pain Points
          </Button>
          <Button
            variant="outline"
            onClick={() => runPrompt("acquisition")}
            disabled={loading}
          >
            Acquisition Plan
          </Button>
          <Button
            variant="outline"
            onClick={() => runPrompt("revenue")}
            disabled={loading}
          >
            Revenue Strategy
          </Button>
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground">Generating...</p>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {output && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            <pre className="whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-sm">
              {output}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
