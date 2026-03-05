"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { trackMetaCustomEvent } from "@/lib/meta-events";

type BlogBottomCTAProps = {
  slug: string;
};

export function BlogBottomCTA({ slug }: BlogBottomCTAProps) {
  return (
    <Card className="my-10 border-2 border-border bg-gradient-to-br from-background to-muted shadow-xl">
      <CardContent className="p-8 text-center sm:p-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Want a personalized longevity plan for your dog?
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Get a custom health score, breed-specific insights, and LOY-002 eligibility in 2
              minutes.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="min-h-12 w-full gap-2 text-base sm:w-auto sm:px-8"
              onClick={() => {
                void trackMetaCustomEvent("BlogCTA_QuizClick", {
                  slug,
                  cta_type: "primary",
                });
              }}
            >
              <Link href="/quiz">
                Take the 2-Min Quiz
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-12 w-full gap-2 text-base sm:w-auto sm:px-8"
              onClick={() => {
                void trackMetaCustomEvent("BlogCTA_TriageClick", {
                  slug,
                  cta_type: "secondary",
                });
              }}
            >
              <Link href="/er-triage-for-dogs">
                Try Free ER Triage Tool
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Both tools are 100% free. No signup required to start.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
