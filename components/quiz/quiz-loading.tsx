"use client";

import { useEffect, useMemo, useState } from "react";

const LOADING_LINES = [
  "Analyzing breed data...",
  "Checking LOY-002 eligibility...",
  "Generating personalized plan...",
] as const;

type QuizLoadingProps = {
  dogName: string;
};

export function QuizLoading({ dogName }: QuizLoadingProps) {
  const [phase, setPhase] = useState(0);
  const lines = useMemo(
    () => LOADING_LINES.map((line) => line.replace("breed", `${dogName}'s breed`)),
    [dogName]
  );

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 900),
      window.setTimeout(() => setPhase(2), 1800),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Calculating score</p>
      <div className="mt-4 space-y-2">
        {lines.map((line, index) => (
          <p
            key={line}
            className={`text-base transition-opacity duration-500 ${
              phase >= index ? "opacity-100" : "opacity-25"
            }`}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
