import type { Metadata } from "next";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { LongevityQuiz } from "@/components/quiz/longevity-quiz";
import { prisma } from "@/lib/prisma";
import { quizBreedOptions } from "@/lib/breed-pages";

export const metadata: Metadata = {
  title: "Free Dog Longevity Quiz — Get Your Dog's Readiness Score | FursBliss",
  description:
    "Take our free 2-minute quiz to get your dog's longevity readiness score. Personalized for your dog's breed, age, and health concerns.",
  alternates: {
    canonical: "/quiz",
  },
  openGraph: {
    title: "Free Dog Longevity Quiz — Get Your Dog's Readiness Score | FursBliss",
    description:
      "Take our free 2-minute quiz to get your dog's longevity readiness score. Personalized for your dog's breed, age, and health concerns.",
    url: "/quiz",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Dog Longevity Quiz — Get Your Dog's Readiness Score | FursBliss",
    description:
      "Take our free 2-minute quiz to get your dog's longevity readiness score. Personalized for your dog's breed, age, and health concerns.",
    images: ["/og-default.jpg"],
  },
};

export const dynamic = "force-dynamic";

type QuizPageProps = {
  searchParams?: {
    resultId?: string;
  };
};

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const session = await auth();
  const breedRows = await prisma.breedProfile.findMany({
    select: { breed: true },
    orderBy: { breed: "asc" },
    take: 250,
  });
  const userCount = await prisma.user.count();
  const breeds = Array.from(
    new Set([...breedRows.map((row) => row.breed), ...quizBreedOptions])
  ).sort((a, b) => a.localeCompare(b));
  const breedOptions = [
    "Mixed Breed / Not Sure",
    ...breeds.filter((breed) => breed !== "Mixed Breed / Not Sure"),
  ];
  const resultId = searchParams?.resultId?.trim();
  const initialSubmission = resultId
    ? await prisma.quizSubmission.findUnique({
        where: { id: resultId },
        select: {
          id: true,
          score: true,
          dogName: true,
          breed: true,
          age: true,
          weight: true,
          concerns: true,
          email: true,
        },
      })
    : null;
  const initialResult = initialSubmission
    ? {
        id: initialSubmission.id,
        score: initialSubmission.score,
        dogName: initialSubmission.dogName || "Your Dog",
        breed: initialSubmission.breed,
        age: initialSubmission.age,
        weight: Number(initialSubmission.weight),
        concern: initialSubmission.concerns[0] ?? "general_longevity",
        email: initialSubmission.email?.includes("@fursbliss.local")
          ? undefined
          : initialSubmission.email,
      }
    : null;
  const isSignedIn = Boolean(session?.user?.id);
  const isPremium = session?.user?.subscriptionStatus === "premium";

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
            Answer 3 quick questions and get a personalized readiness score with practical next steps.
          </p>
        </section>

        <LongevityQuiz
          breeds={breedOptions}
          isPremium={isPremium}
          isSignedIn={isSignedIn}
          userCount={userCount}
          initialResult={initialResult}
        />
      </main>
      <SiteFooter />
    </div>
  );
}

