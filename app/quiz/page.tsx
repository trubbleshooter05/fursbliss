import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { LongevityQuiz } from "@/components/quiz/longevity-quiz";
import { prisma } from "@/lib/prisma";
import { quizBreedOptions } from "@/lib/breed-pages";

const SHARE_IMAGE_URL = "/opengraph-image";

export const metadata: Metadata = {
  title: "Free Dog Longevity Readiness Quiz | FursBliss",
  description:
    "Take the 60-second FursBliss quiz and get your dog's personalized longevity readiness score.",
  alternates: {
    canonical: "/quiz",
  },
  openGraph: {
    title: "Free Dog Longevity Readiness Quiz | FursBliss",
    description:
      "Take the 60-second FursBliss quiz and get your dog's personalized longevity readiness score.",
    url: "/quiz",
    type: "website",
    images: [SHARE_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    images: [SHARE_IMAGE_URL],
  },
};

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const breedRows = await prisma.breedProfile.findMany({
    select: { breed: true },
    orderBy: { breed: "asc" },
    take: 250,
  });
  const breeds = Array.from(
    new Set([...breedRows.map((row) => row.breed), ...quizBreedOptions])
  ).sort((a, b) => a.localeCompare(b));
  const breedOptions = [
    "Mixed Breed / Not Sure",
    ...breeds.filter((breed) => breed !== "Mixed Breed / Not Sure"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <section
          className="relative mb-8 overflow-hidden rounded-3xl border border-sky-200 p-6 md:p-8"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(135deg, #dbeafe 0%, #bfdbfe 55%, #93c5fd 100%)",
            backgroundSize: "20px 20px, 100% 100%",
          }}
        >
          <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            A $250M+-backed longevity drug for dogs could arrive in 2026.
          </p>
          <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-sky-800/90">
            Longevity readiness quiz
          </p>
          <h1 className="relative mt-3 font-display text-4xl tracking-[-0.03em] text-slate-900 md:text-5xl">
            How ready is your dog for the longevity revolution?
          </h1>
          <p className="relative mt-3 max-w-2xl text-slate-700">
            Answer 4 quick questions and get a personalized readiness score with
            practical next steps.
          </p>
        </section>

        <LongevityQuiz breeds={breedOptions} />
      </main>
      <SiteFooter />
    </div>
  );
}

