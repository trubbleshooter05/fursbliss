"use client";

import Link from "next/link";
import { Lock, TrendingUp, FileText, PawPrint, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TierGateType = 
  | "second-pet" 
  | "old-history" 
  | "health-alerts" 
  | "pattern-detection" 
  | "vet-report"
  | "medication-tracking";

type TierGatePromptProps = {
  type: TierGateType;
  petName?: string;
  lockedCount?: number;
  pattern?: string;
};

const GATE_CONFIG: Record<TierGateType, {
  icon: typeof Lock;
  title: string;
  description: (props: TierGatePromptProps) => string;
  ctaText: string;
  upgradeReason: string;
}> = {
  "second-pet": {
    icon: PawPrint,
    title: "Upgrade to Track Multiple Dogs",
    description: () => "Free accounts can track 1 dog. Upgrade to Pro to manage unlimited pets in one dashboard.",
    ctaText: "Upgrade to Pro — $9/mo",
    upgradeReason: "Track all your dogs in one place",
  },
  "old-history": {
    icon: TrendingUp,
    title: "Unlock Full Health Timeline",
    description: (props) => `You have ${props.lockedCount || "older"} entries from more than 30 days ago. See trends over months, not just weeks.`,
    ctaText: "Unlock Full History — $9/mo",
    upgradeReason: "See long-term health patterns",
  },
  "health-alerts": {
    icon: AlertTriangle,
    title: "⚠️ Pattern Detected — Upgrade to See Details",
    description: (props) => `${props.petName || "Your dog"} has a developing health pattern. Premium members get real-time alerts when metrics shift.`,
    ctaText: "Unlock Health Alerts — $9/mo",
    upgradeReason: "Get notified when patterns change",
  },
  "pattern-detection": {
    icon: TrendingUp,
    title: "Behavior Pattern Detected",
    description: (props) => props.pattern || "We've detected a change in behavior frequency. Upgrade to see detailed pattern analysis and early warning alerts.",
    ctaText: "See Pattern Details — $9/mo",
    upgradeReason: "Catch problems 3 months early",
  },
  "vet-report": {
    icon: FileText,
    title: "Download Vet-Ready Report",
    description: (props) => `Generate a comprehensive PDF report for ${props.petName || "your dog"}'s vet with health trends, logs, and medication history.`,
    ctaText: "Unlock Vet Reports — $9/mo",
    upgradeReason: "Save $200+ in unnecessary tests",
  },
  "medication-tracking": {
    icon: FileText,
    title: "Medication Tracking (Pro Feature)",
    description: () => "Track medications, set reminders, and log doses. Available with Pro subscription.",
    ctaText: "Upgrade to Pro — $9/mo",
    upgradeReason: "Never miss a dose",
  },
};

export function TierGatePrompt({ type, petName, lockedCount, pattern }: TierGatePromptProps) {
  const config = GATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Card className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Icon className="h-5 w-5" />
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-amber-800">
          {config.description({ type, petName, lockedCount, pattern })}
        </p>
        <div className="space-y-2">
          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
            <Link href={`/pricing?source=${type}`}>
              {config.ctaText}
            </Link>
          </Button>
          <p className="text-center text-xs text-amber-700">
            {config.upgradeReason} • Cancel anytime
          </p>
          <Button asChild variant="link" className="w-full text-xs text-amber-700">
            <Link href={`/pricing?source=${type}`}>
              Or save 45% with yearly billing
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
