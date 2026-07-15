import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExcludeAnalytics } from "@/components/admin/exclude-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function rate(numerator: number, denominator: number): string {
  if (!denominator) return "n/a";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const events = await prisma.funnelEvent.groupBy({
    by: ["name"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });
  const counts = Object.fromEntries(events.map((e) => [e.name, e._count._all]));

  const homepageVisits = counts["page_view"] ?? 0; // only / and /pricing are stored; refine below
  const homeRows = await prisma.funnelEvent.count({
    where: { createdAt: { gte: since }, name: "page_view", path: "/" },
  });
  const pricingVisits = await prisma.funnelEvent.count({
    where: {
      createdAt: { gte: since },
      OR: [{ name: "pricing_viewed" }, { name: "page_view", path: "/pricing" }],
    },
  });
  const signupStarts = counts["signup_started"] ?? 0;
  const checkoutStarts = counts["checkout_started"] ?? 0;
  const purchases = counts["purchase"] ?? 0;

  const dbSignups = await prisma.user.count({ where: { createdAt: { gte: since } } });
  const dbPremium = await prisma.user.count({
    where: {
      createdAt: { gte: since },
      subscriptionStatus: "premium",
    },
  });
  const urgentPaid = await prisma.urgentAnswerEntitlement.count({
    where: { createdAt: { gte: since } },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <ExcludeAnalytics />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Funnel analytics (30 days)</h1>
          <p className="text-sm text-muted-foreground">
            First-party FunnelEvent store + DB cross-check. GA4 Explore remains source of truth for full traffic.
          </p>
        </div>
        <Link href="/admin" className="text-sm underline">
          Back to admin
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Homepage visits</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{homeRows}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pricing visits</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{pricingVisits}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Signup starts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{signupStarts}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Checkout starts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{checkoutStarts}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed purchases (events)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{purchases}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DB: signups / premium / urgent</CardTitle>
          </CardHeader>
          <CardContent className="text-lg">
            {dbSignups} / {dbPremium} / {urgentPaid}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>Homepage → pricing: {rate(pricingVisits, homeRows || homepageVisits)}</div>
          <div>Pricing → checkout: {rate(checkoutStarts, pricingVisits)}</div>
          <div>Checkout → paid: {rate(purchases, checkoutStarts)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw funnel event counts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => (
                <li key={name}>
                  <code>{name}</code>: {count}
                </li>
              ))}
            {events.length === 0 && <li>No FunnelEvent rows yet (deploy + browse once).</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
