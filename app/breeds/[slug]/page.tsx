import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { breedPages } from "@/lib/breed-pages";

type PageProps = {
  params: { slug: string };
};

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
      </main>
      <SiteFooter />
    </div>
  );
}
