import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ResultsDownloadReportProps = {
  quizId: string;
  isSignedIn: boolean;
  ownsQuiz: boolean;
  signupHref: string;
};

export function ResultsDownloadReport({
  quizId,
  isSignedIn,
  ownsQuiz,
  signupHref,
}: ResultsDownloadReportProps) {
  if (!isSignedIn) {
    return (
      <Card className="rounded-2xl border-border bg-white">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-slate-700">
            Create free account to download your dog&apos;s Longevity Readiness Report.
          </p>
          <Button asChild className="min-h-11 w-full">
            <Link href={signupHref}>Create free account to download report</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (ownsQuiz) {
    return (
      <Card className="rounded-2xl border-border bg-white">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-slate-700">
            Download a branded 1-page PDF with score, eligibility, lifespan reference,
            and personalized next steps.
          </p>
          <Button asChild className="min-h-11 w-full">
            <a href={`/api/reports/longevity/${quizId}`}>Download PDF Report</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border bg-white">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm text-slate-700">
          This report is available once this quiz result is saved to your account.
        </p>
      </CardContent>
    </Card>
  );
}
