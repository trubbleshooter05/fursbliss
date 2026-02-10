"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type StructuredAnalysis = {
  overallRisk: "LOW" | "MODERATE" | "HIGH";
  summary: string;
  interactions: Array<{
    items: string[];
    severity: "SAFE" | "CAUTION" | "AVOID";
    explanation: string;
    recommendation: string;
  }>;
  dosageConcerns: string[];
  redundancies: string[];
  vetQuestions: string[];
};

export default function InteractionCheckPage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id;
  const [stack, setStack] = useState("");
  const [addItem, setAddItem] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [structured, setStructured] = useState<StructuredAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!petId) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setStructured(null);
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
      setStructured(data.structured ?? null);
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
        <p className="text-xs text-muted-foreground">
          Interaction results are decision support only. Always verify with your
          veterinarian before making changes.
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

      {structured && (
        <Card>
          <CardHeader>
            <CardTitle>Structured result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <Badge className={getRiskBadgeClass(structured.overallRisk)}>
                Overall risk: {structured.overallRisk}
              </Badge>
              <p className="text-muted-foreground">{structured.summary}</p>
            </div>

            {structured.interactions.length === 0 ? (
              <p className="text-muted-foreground">No direct interactions found.</p>
            ) : (
              <div className="space-y-2">
                {structured.interactions.map((interaction, index) => (
                  <div
                    key={`${interaction.items.join("-")}-${index}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <p className="font-medium text-slate-900">
                      {interaction.items.join(" + ")}
                    </p>
                    <p className={getSeverityTextClass(interaction.severity)}>
                      {interaction.severity}
                    </p>
                    <p>{interaction.explanation}</p>
                    <p className="text-xs text-muted-foreground">
                      Recommendation: {interaction.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {structured.dosageConcerns.length > 0 && (
              <div>
                <p className="font-medium text-slate-900">Dosage concerns</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {structured.dosageConcerns.map((concern) => (
                    <li key={concern}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}

            {structured.redundancies.length > 0 && (
              <div>
                <p className="font-medium text-slate-900">Potential redundancies</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {structured.redundancies.map((redundancy) => (
                    <li key={redundancy}>{redundancy}</li>
                  ))}
                </ul>
              </div>
            )}

            {structured.vetQuestions.length > 0 && (
              <div>
                <p className="font-medium text-slate-900">Questions for your vet</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {structured.vetQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Raw model output</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-slate-700">
            {result}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getRiskBadgeClass(risk: StructuredAnalysis["overallRisk"]) {
  if (risk === "HIGH") {
    return "bg-red-500/10 text-red-700";
  }
  if (risk === "MODERATE") {
    return "bg-amber-500/10 text-amber-700";
  }
  return "bg-emerald-500/10 text-emerald-700";
}

function getSeverityTextClass(severity: StructuredAnalysis["interactions"][number]["severity"]) {
  if (severity === "AVOID") {
    return "text-sm font-semibold text-red-700";
  }
  if (severity === "CAUTION") {
    return "text-sm font-semibold text-amber-700";
  }
  return "text-sm font-semibold text-emerald-700";
}
