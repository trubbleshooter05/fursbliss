import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { estimateTokensFromText, estimateUsdCost } from "@/lib/ai-costs";

type DailyAggregate = {
  date: string;
  requests: number;
  estimatedCostUsd: number;
};

type TypeAggregate = {
  type: string;
  requests: number;
  estimatedCostUsd: number;
};

export default async function AdminAiCostsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const insights = await prisma.aIInsight.findMany({
    where: { createdAt: { gte: since } },
    select: {
      id: true,
      type: true,
      model: true,
      prompt: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  let totalCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const byDayMap = new Map<string, DailyAggregate>();
  const byTypeMap = new Map<string, TypeAggregate>();

  for (const row of insights) {
    const inputTokens = estimateTokensFromText(row.prompt);
    const outputTokens = estimateTokensFromText(row.content);
    const estimatedCostUsd = estimateUsdCost({
      model: row.model || "gpt-4o-mini",
      inputTokens,
      outputTokens,
    });

    totalCost += estimatedCostUsd;
    totalInputTokens += inputTokens;
    totalOutputTokens += outputTokens;

    const day = row.createdAt.toISOString().slice(0, 10);
    const dayEntry = byDayMap.get(day) ?? { date: day, requests: 0, estimatedCostUsd: 0 };
    dayEntry.requests += 1;
    dayEntry.estimatedCostUsd += estimatedCostUsd;
    byDayMap.set(day, dayEntry);

    const typeEntry = byTypeMap.get(row.type) ?? {
      type: row.type,
      requests: 0,
      estimatedCostUsd: 0,
    };
    typeEntry.requests += 1;
    typeEntry.estimatedCostUsd += estimatedCostUsd;
    byTypeMap.set(row.type, typeEntry);
  }

  const byDay = Array.from(byDayMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  const byType = Array.from(byTypeMap.values()).sort(
    (a, b) => b.estimatedCostUsd - a.estimatedCostUsd
  );
  const avgDailyCost = byDay.length > 0 ? totalCost / byDay.length : 0;
  const dailyBudget = Number(process.env.OPENAI_DAILY_BUDGET_USD || 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">AI Cost Dashboard</h1>
        <p className="text-muted-foreground">
          Estimated OpenAI costs from the last 30 days of AI insight requests.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="30-day estimated cost" value={`$${totalCost.toFixed(2)}`} />
        <MetricCard label="Average daily cost" value={`$${avgDailyCost.toFixed(2)}`} />
        <MetricCard label="Estimated input tokens" value={totalInputTokens.toLocaleString()} />
        <MetricCard label="Estimated output tokens" value={totalOutputTokens.toLocaleString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget status</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {dailyBudget > 0 ? (
            <p>
              Daily budget configured: ${dailyBudget.toFixed(2)}. Current average daily estimate: $
              {avgDailyCost.toFixed(2)}.
            </p>
          ) : (
            <p>
              No daily budget env set. Add <code>OPENAI_DAILY_BUDGET_USD</code> to enforce cost guardrails.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost by feature type</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Estimated cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byType.map((row) => (
                <TableRow key={row.type}>
                  <TableCell className="font-medium">{row.type}</TableCell>
                  <TableCell>{row.requests}</TableCell>
                  <TableCell>${row.estimatedCostUsd.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily AI cost trend (estimated)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Estimated cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byDay.map((row) => (
                <TableRow key={row.date}>
                  <TableCell className="font-medium">{row.date}</TableCell>
                  <TableCell>{row.requests}</TableCell>
                  <TableCell>${row.estimatedCostUsd.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
