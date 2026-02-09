import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LongevityDrugsPage() {
  const statuses = await prisma.fDADrugStatus.findMany({
    orderBy: { drugName: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16 space-y-10">
        <section className="space-y-4">
          <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
            Longevity Drug Hub
          </Badge>
          <h1 className="text-4xl font-semibold text-slate-900">
            The first FDA dog longevity drug is coming.
          </h1>
          <p className="text-muted-foreground">
            Track LOY-002 status, eligibility, and readiness. FursBliss is not
            affiliated with Loyal or the FDA.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>LOY-002 eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                LOY-002 is being studied for senior dogs 10+ years old and 14+ lbs.
              </p>
              <p>
                We will notify you when availability changes and when your pet is
                eligible.
              </p>
              <Button asChild className="mt-2">
                <a href="/signup">Track my dog</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rapamycin awareness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Rapamycin is available off-label with a veterinarian prescription.
              </p>
              <p>
                Use FursBliss to log dosing, side effects, and outcomes over time.
              </p>
              <Button variant="outline" asChild className="mt-2">
                <a href="/login">Open rapamycin tracking</a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">FDA status tracker</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {statuses.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-sm text-muted-foreground">
                  FDA status data is being prepared. Check back soon.
                </CardContent>
              </Card>
            ) : (
              statuses.map((status) => (
                <Card key={status.id}>
                  <CardHeader className="space-y-2">
                    <CardTitle>{status.drugName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {status.company}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-slate-900">Status: </span>
                      {status.currentStatus}
                    </p>
                    <p>{status.statusDetail}</p>
                    <p>
                      <span className="font-medium text-slate-900">Updated: </span>
                      {status.lastUpdated.toDateString()}
                    </p>
                    {status.estimatedApproval && (
                      <p>
                        <span className="font-medium text-slate-900">
                          Est. approval:{" "}
                        </span>
                        {status.estimatedApproval}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
