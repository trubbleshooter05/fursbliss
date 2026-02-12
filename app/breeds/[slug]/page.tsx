import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { breedPages } from "@/lib/breed-pages";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await prisma.breedProfile.findUnique({
    where: { seoSlug: params.slug },
    select: { seoTitle: true, seoDescription: true },
  });
  if (profile) {
    return {
      title: `${profile.seoTitle} | FursBliss`,
      description: profile.seoDescription,
    };
  }
  const fallback = breedPages.find((page) => page.slug === params.slug);
  if (!fallback) {
    return {
      title: "Breed Guide | FursBliss",
      description: "Breed-specific longevity and supplement guidance.",
    };
  }
  return {
    title: `${fallback.title} | FursBliss`,
    description: fallback.description,
  };
}

export default async function BreedDetailPage({ params }: PageProps) {
  const profile = await prisma.breedProfile.findUnique({
    where: { seoSlug: params.slug },
  });

  if (!profile) {
    const fallback = breedPages.find((page) => page.slug === params.slug);
    if (!fallback) {
      return notFound();
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl px-6 py-16 space-y-6">
          <div className="relative h-64 overflow-hidden rounded-3xl border border-border">
            <Image
              src={`https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80&sig=${params.slug.length}`}
              alt={`${fallback.title} photo`}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/15" />
          </div>
          <h1 className="text-4xl font-semibold text-slate-900">{fallback.title}</h1>
          <p className="text-muted-foreground">{fallback.description}</p>
          <Card>
            <CardHeader>
              <CardTitle>Supplement focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {fallback.focus.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Informational guidance only. Always consult your veterinarian for diagnosis
            and treatment decisions.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const riskTimeline = JSON.parse(profile.riskTimeline) as {
    age: number;
    risk: string;
    severity: string;
  }[];

  const supplementRecs = JSON.parse(profile.supplementRecs) as {
    supplement: string;
    startAge: number;
    reason: string;
  }[];

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-16 space-y-6">
        <div className="relative h-64 overflow-hidden rounded-3xl border border-border">
          <Image
            src={`https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80&sig=${params.slug.length + 11}`}
            alt={`${profile.breed} dog`}
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/15" />
        </div>
        <h1 className="text-4xl font-semibold text-slate-900">{profile.seoTitle}</h1>
        <p className="text-muted-foreground">{profile.seoDescription}</p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Risk timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {riskTimeline.map((risk) => (
                <p key={`${risk.age}-${risk.risk}`}>
                  Age {risk.age}: {risk.risk} ({risk.severity})
                </p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Supplement plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {supplementRecs.map((rec) => (
                <p key={`${rec.supplement}-${rec.startAge}`}>
                  {rec.supplement} starting age {rec.startAge}: {rec.reason}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground">
          FursBliss AI and breed content supports owner education and is not a
          substitute for professional veterinary care.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
