import { notFound } from "next/navigation";
import { breedPages } from "@/lib/breed-pages";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return breedPages.map((page) => ({ slug: page.slug }));
}

export default function SupplementPage({ params }: PageProps) {
  const page = breedPages.find((item) => item.slug === params.slug);
  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Breed insights
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">{page.title}</h1>
          <p className="text-muted-foreground">{page.description}</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {page.focus.map((item) => (
            <Card key={item} className="border border-slate-200/60 bg-white">
              <CardHeader>
                <CardTitle>{item}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Learn how {item} supports healthy aging and long-term vitality.
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
