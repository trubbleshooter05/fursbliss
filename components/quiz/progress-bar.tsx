"use client";

import { Clock } from "lucide-react";

type ProgressBarProps = {
  step: number;
  totalSteps: number;
  label?: string;
};

export function ProgressBar({ step, totalSteps, label }: ProgressBarProps) {
  const safeStep = Math.min(Math.max(step, 1), totalSteps);
  const progress = (safeStep / totalSteps) * 100;
  
  // Calculate estimated time remaining (30 seconds per step)
  const secondsRemaining = (totalSteps - safeStep) * 30;
  const timeText = secondsRemaining <= 60 
    ? `Just ${secondsRemaining} seconds left` 
    : `About ${Math.ceil(secondsRemaining / 60)} minutes left`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-foreground">
          {label ?? `Question ${safeStep} of ${totalSteps}`}
        </p>
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{timeText}</span>
        </div>
      </div>
      <div className="h-3 rounded-full bg-muted shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {safeStep === totalSteps - 1 && (
        <p className="text-sm font-semibold text-emerald-700 animate-in fade-in slide-in-from-top-1 duration-300">
          🎉 Almost there! Just 1 more question
        </p>
      )}
    </div>
  );
}
