import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareScoreButton } from "@/components/quiz/share-score-button";
import { ResultsDownloadReport } from "@/components/quiz/results-download-report";
import { LoyNotifyForm } from "@/components/longevity/loy-notify-form";
import { buildQuizRecommendations } from "@/lib/quiz";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Longevity Quiz Results | FursBliss",
  description:
    "View your dog's personalized longevity readiness score and recommended next actions.",
};

type PageProps = {
  params: { id: string };
};

export default async function QuizResultsPage({ params }: PageProps) {
  const session = await auth();
  const submission = await prisma.quizSubmission.findUnique({
    where: { id: params.id },
  });

  if (!submission) {
    notFound();
  }

  const recommendations = buildQuizRecommendations({
    dogName: submission.dogName,
    breed: submission.breed,
    age: submission.age,
    weight: submission.weight,
    concerns: submission.concerns,
    score: submission.score,
  });

  const eligibleForLoy = submission.age >= 10 && submission.weight >= 14;
  const breedProfile = await prisma.breedProfile.findFirst({
    where: { breed: submission.breed },
    select: { averageLifespan: true },
  });
  const remainingYears = Math.max(
    0,
    (breedProfile?.averageLifespan ?? 12) - submission.age
  );
  const isSignedIn = Boolean(session?.user?.id);
  const ownsQuiz = Boolean(session?.user?.id && submission.userId === session.user.id);
  const signupFromQuizHref = `/signup?fromQuiz=1&quizId=${submission.id}&dogName=${encodeURIComponent(
    submission.dogName
  )}&breed=${encodeURIComponent(submission.breed)}&age=${submission.age}&weight=${
    submission.weight
  }&concerns=${encodeURIComponent(submission.concerns.join(","))}&email=${encodeURIComponent(
    submission.email
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        <section className="mb-8 rounded-3xl border border-border bg-card p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Longevity Readiness Score
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            {submission.dogName}&apos;s score: {submission.score}/100
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Encouraging start. Improve this score by tracking daily health signals
            and proactively preparing for longevity interventions.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Score factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <FactorRow
                label="LOY-002 eligibility"
                value={eligibleForLoy ? "Eligible" : "Not yet eligible"}
                progress={eligibleForLoy ? 100 : 45}
              />
              <FactorRow
                label="Breed longevity runway"
                value={`${remainingYears.toFixed(1)} years estimated`}
                progress={Math.min(100, Math.max(20, remainingYears * 18))}
              />
              <FactorRow
                label="Health monitoring"
                value="Not yet tracking"
                progress={30}
              />
              <FactorRow
                label="Supplement optimization"
                value="Not yet checked"
                progress={35}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Personalized recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {recommendations.map((rec) => (
                <div key={rec} className="rounded-xl bg-muted p-3">
                  {rec}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <section className="mt-8 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 md:p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Next step
            </p>
            <h2 className="font-display text-3xl tracking-[-0.02em] text-slate-900">
              Your dog is LOY-002 eligible. What&apos;s next?
            </h2>
            <p className="text-sm text-slate-700">
              Save this result to your account so you can keep tracking and receive
              LOY-002 timeline updates.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ResultsDownloadReport
              quizId={submission.id}
              isSignedIn={isSignedIn}
              ownsQuiz={ownsQuiz}
              signupHref={signupFromQuizHref}
            />
            <Card className="rounded-2xl border-border bg-white">
              <CardContent className="space-y-3 p-4">
                <LoyNotifyForm
                  source="loy002"
                  defaultEmail={submission.email}
                  submitLabel="Get notified when LOY-002 launches"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/longevity-drugs">Read the full LOY-002 timeline</Link>
            </Button>
            <ShareScoreButton
              dogName={submission.dogName}
              resultPath={`/quiz/results/${submission.id}`}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function FactorRow({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-muted-foreground">{value}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

