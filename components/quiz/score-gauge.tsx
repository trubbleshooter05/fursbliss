"use client";

import { useEffect, useMemo, useState } from "react";
import { getQuizScoreBand } from "@/lib/quiz-results";

function gaugeColors(score: number) {
  const band = getQuizScoreBand(score);
  if (band === "critical") return { ring: "#ef4444", bg: "bg-rose-50", text: "text-rose-700" };
  if (band === "improve") return { ring: "#f97316", bg: "bg-orange-50", text: "text-orange-700" };
  if (band === "optimize") return { ring: "#eab308", bg: "bg-yellow-50", text: "text-yellow-700" };
  return { ring: "#22c55e", bg: "bg-emerald-50", text: "text-emerald-700" };
}

export function ScoreGauge({ score, dogName }: { score: number; dogName: string }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const colors = useMemo(() => gaugeColors(clampedScore), [clampedScore]);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 32;
    const timer = window.setInterval(() => {
      frame += 1;
      const next = Math.round((clampedScore * frame) / totalFrames);
      setAnimatedScore(next);
      if (frame >= totalFrames) {
        window.clearInterval(timer);
      }
    }, 18);
    return () => window.clearInterval(timer);
  }, [clampedScore]);

  const progress = (animatedScore / 100) * 360;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 text-center">
      <div
        className={`relative h-48 w-48 rounded-full ${colors.bg} shadow-sm`}
        style={{
          background: `conic-gradient(${colors.ring} ${progress}deg, #e5e7eb ${progress}deg 360deg)`,
        }}
      >
        <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white">
          <div>
            <p className="text-5xl font-bold text-slate-900">{animatedScore}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">out of 100</p>
          </div>
        </div>
      </div>
      <p className={`text-sm font-semibold ${colors.text}`}>{dogName}&apos;s readiness score</p>
    </div>
  );
}
