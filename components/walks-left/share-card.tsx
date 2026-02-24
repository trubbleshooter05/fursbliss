"use client";

import type { LifeExpectancyRange } from "@/lib/breed-data";

export type WalksLeftMetrics = {
  walksLeft: number;
  weekendsLeft: number;
  sunsetsLeft: number;
  carRidesLeft: number;
  couchHoursLeft: number;
  heartbeatsMillions: number;
  bellyRubsLeft: number;
  morningGreetingsLeft: number;
};

type ShareCardProps = {
  dogName: string;
  breed: string;
  ageLabel: string;
  metrics: WalksLeftMetrics;
  expectancy: LifeExpectancyRange;
  className?: string;
};

export function ShareCard({
  dogName,
  breed,
  ageLabel,
  metrics,
  expectancy,
  className,
}: ShareCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-[#2B134E] via-[#4A206D] to-[#D0643B] p-6 text-white shadow-2xl ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_40%),radial-gradient(circle_at_80%_75%,rgba(255,173,96,0.25),transparent_35%)]" />
      <div className="relative z-10 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/80">How many walks left</p>
          <h3 className="font-display text-4xl tracking-[-0.03em] md:text-5xl">{dogName}</h3>
          <p className="text-sm text-white/85">
            {breed} • {ageLabel}
          </p>
        </div>

        <div className="space-y-2 text-base md:text-lg">
          <p>🐾 {metrics.walksLeft.toLocaleString()} more walks</p>
          <p>🌅 {metrics.sunsetsLeft.toLocaleString()} more sunsets</p>
          <p>🗓️ {metrics.weekendsLeft.toLocaleString()} more weekends</p>
          <p>🚗 {metrics.carRidesLeft.toLocaleString()} more car rides</p>
          <p>🛋️ {metrics.couchHoursLeft.toLocaleString()} more couch hours</p>
          <p>💓 {metrics.heartbeatsMillions.toFixed(1)} million more heartbeats</p>
        </div>

        <p className="text-xs text-white/80">
          Based on average {breed} life expectancy of {expectancy.low}-{expectancy.high} years.
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-white/70">fursbliss.com/walks-left</p>
      </div>
    </div>
  );
}
