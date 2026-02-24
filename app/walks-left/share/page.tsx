import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { parseWalksLeftShareFromSearchParams } from "@/lib/walks-left-share";

type SharePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function toUrlSearchParams(searchParams: SharePageProps["searchParams"]) {
  const params = new URLSearchParams();
  if (!searchParams) return params;
  for (const [key, value] of Object.entries(searchParams)) {
    const first = firstValue(value);
    if (first) {
      params.set(key, first);
    }
  }
  return params;
}

export function generateMetadata({ searchParams }: SharePageProps): Metadata {
  const params = toUrlSearchParams(searchParams);
  const payload = parseWalksLeftShareFromSearchParams(params);

  if (!payload) {
    return {
      title: "How Many Walks Left With Your Dog? | Free Calculator — FursBliss",
      description:
        "Find out exactly how many walks, weekends, and sunsets you have left with your dog. A free tool every dog owner needs to see.",
      robots: { index: false, follow: true },
      alternates: { canonical: "/walks-left/share" },
      openGraph: {
        title: "How Many Walks Left With Your Dog? | Free Calculator — FursBliss",
        description:
          "Find out exactly how many walks, weekends, and sunsets you have left with your dog. A free tool every dog owner needs to see.",
        url: "/walks-left/share",
        type: "website",
        images: ["/walks-left/opengraph-image"],
      },
      twitter: {
        card: "summary_large_image",
        title: "How Many Walks Left With Your Dog? | Free Calculator — FursBliss",
        description:
          "Find out exactly how many walks, weekends, and sunsets you have left with your dog. A free tool every dog owner needs to see.",
        images: ["/walks-left/opengraph-image"],
      },
    };
  }

  const title = `${payload.name} has ${payload.walks.toLocaleString()} walks left`;
  const description = `${payload.name} could still have ${payload.walks.toLocaleString()} walks, ${payload.weekends.toLocaleString()} weekends, and ${payload.sunsets.toLocaleString()} sunsets left.`;
  const imageUrl = `/api/walks-left/share-image?${params.toString()}`;

  return {
    title: `${title} | FursBliss`,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: "/walks-left/share" },
    openGraph: {
      title: `${title} | FursBliss`,
      description,
      url: `/walks-left/share?${params.toString()}`,
      type: "website",
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | FursBliss`,
      description,
      images: [imageUrl],
    },
  };
}

export default function WalksLeftSharePage({ searchParams }: SharePageProps) {
  const params = toUrlSearchParams(searchParams);
  const payload = parseWalksLeftShareFromSearchParams(params);

  const calculatorParams = new URLSearchParams();
  if (payload) {
    calculatorParams.set("name", payload.name);
    calculatorParams.set("breed", payload.breed);
  }
  const calculatorHref = `/walks-left${calculatorParams.toString() ? `?${calculatorParams.toString()}` : ""}`;

  return (
    <div className="min-h-screen bg-[#12091f] text-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
        <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Shared from FursBliss</p>
          {payload ? (
            <>
              <h1 className="mt-3 font-display text-4xl tracking-[-0.03em]">
                {payload.name} has {payload.walks.toLocaleString()} walks left
              </h1>
              <p className="mt-3 text-white/85">
                Estimated moments ahead for a {payload.breed}: {payload.weekends.toLocaleString()} weekends and{" "}
                {payload.sunsets.toLocaleString()} sunsets.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-3 font-display text-4xl tracking-[-0.03em]">
                How Many Walks Left With Your Dog?
              </h1>
              <p className="mt-3 text-white/85">
                This shared link has expired or is invalid. Run a fresh calculation to generate a new one.
              </p>
            </>
          )}
          <div className="mt-6">
            <Link
              href={calculatorHref}
              className="inline-flex min-h-11 items-center rounded-md bg-[#ff8b5b] px-5 py-3 font-semibold text-black hover:brightness-110"
            >
              Try the free calculator
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
