"use client";

import Link from "next/link";
import { TrendingDown, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnergyTrendChart } from "@/components/dashboard/energy-trend-chart";

type SevenDayInsightCardProps = {
  petName: string;
  daysTracked: number;
  avgEnergy: number;
  avgAppetite: number;
  avgMobility: number;
  mobilityDipped?: boolean;
  energyDipped?: boolean;
  appetiteDipped?: boolean;
  chartData: { date: string; energy: number }[];
};

export function SevenDayInsightCard({
  petName,
  daysTracked,
  avgEnergy,
  avgAppetite,
  avgMobility,
  mobilityDipped,
  energyDipped,
  appetiteDipped,
  chartData,
}: SevenDayInsightCardProps) {
  const insight =
    energyDipped || appetiteDipped || mobilityDipped
      ? `${petName}'s ${mobilityDipped ? "mobility" : energyDipped ? "energy" : "appetite"} dipped this week — keep watching`
      : `${petName}'s energy averaged ${avgEnergy.toFixed(1)} this week`;

  return (
    <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary" />
          Your first week of data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{insight}</p>

        {/* Mini trend line */}
        {chartData.length > 0 && (
          <EnergyTrendChart data={chartData} className="h-32 w-full" />
        )}

        {/* Metric summary */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Energy</span>
            <span className="font-medium">{avgEnergy.toFixed(1)}/10</span>
            {energyDipped && (
              <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Appetite</span>
            <span className="font-medium">{avgAppetite.toFixed(1)}/10</span>
            {appetiteDipped && (
              <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Mobility</span>
            <span className="font-medium">{avgMobility.toFixed(1)}/10</span>
            {mobilityDipped && (
              <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Keep logging to unlock your full 30-day Vet Summary Report.
        </p>
        <Button asChild>
          <Link href="/logs/new">Log Today&apos;s Check</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
