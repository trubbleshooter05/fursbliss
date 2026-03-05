"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";
import { trackMetaCustomEvent } from "@/lib/meta-events";

type InlineEmailCaptureProps = {
  slug: string;
};

export function InlineEmailCapture({ slug }: InlineEmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [viewTracked, setViewTracked] = useState(false);

  // Track view event on mount
  useEffect(() => {
    if (!viewTracked) {
      void trackMetaCustomEvent("BlogEmailCapture_View", { slug });
      setViewTracked(true);
    }
  }, [viewTracked, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist/loy002", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: "loy002",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      // Track successful submission
      void trackMetaCustomEvent("BlogEmailCapture_Submit", {
        slug,
        email_captured: true,
      });

      setIsSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="my-8 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-6 w-6 text-emerald-700" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-emerald-900">
            You're on the list ✓
          </h3>
          <p className="mt-2 text-sm text-emerald-800">
            We'll email you when LOY-002 approval or availability updates happen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground sm:text-2xl">
              Get LOY-002 updates before anyone else
            </h3>
            <p className="text-sm text-muted-foreground">
              Join 1,200+ dog owners tracking the first FDA dog longevity drug.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="flex-1"
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Notify Me"
              )}
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="text-xs text-muted-foreground">
            We'll only email you about LOY-002 approval milestones. Unsubscribe anytime.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
