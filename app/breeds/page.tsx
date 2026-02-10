import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { breedPages } from "@/lib/breed-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Breed Longevity Guides | FursBliss",
  description:
    "Evidence-based longevity guides by dog breed with risk timelines, supplement planning, and preventive care guidance.",
};

export default async function BreedsPage() {
  const profiles = await prisma.breedProfile.findMany({
    orderBy: { breed: "asc" },
  });

  const items =
    profiles.length > 0
      ? profiles.map((profile) => ({
          slug: profile.seoSlug,
          title: profile.seoTitle,
          description: profile.seoDescription,
        }))
      : breedPages.map((page) => ({
          slug: page.slug,
          title: page.title,
          description: page.description,
        }));

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16 space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Breeds
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Breed longevity guides
          </h1>
          <p className="text-muted-foreground">
            Evidence-based supplements and health risks by breed.
          </p>
          <p className="text-xs text-muted-foreground">
            Educational guidance only. Confirm supplement and medication decisions with
            your veterinarian.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.slug}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{item.description}</p>
                <Link className="text-emerald-600 hover:underline" href={`/breeds/${item.slug}`}>
                  View guide →
                </Link>
                <Link className="text-slate-700 hover:underline" href="/signup">
                  Create a personalized plan →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
