"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { X } from "lucide-react";
import { useState } from "react";

function BannerInner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const utm = searchParams.get("utm_source") ?? "";
  const ref = searchParams.get("ref") ?? "";

  const isSocial =
    utm === "tiktok" || utm === "instagram" || utm === "facebook" ||
    utm === "x" || utm === "twitter" || ref === "social" ||
    ref === "tiktok" || ref === "ig" || ref === "fb";

  if (!isSocial || dismissed) return null;

  const label =
    utm === "tiktok" || ref === "tiktok" ? "TikTok" :
    utm === "instagram" || ref === "ig" ? "Instagram" :
    utm === "facebook" || ref === "fb" ? "Facebook" :
    utm === "x" || utm === "twitter" ? "X" :
    "social";

  return (
    <div className="relative z-50 bg-[#14919B] text-white px-4 py-3 text-center text-sm font-medium">
      <span className="mr-2">👋 Saw us on {label}?</span>
      <Link
        href="/triage"
        className="underline underline-offset-2 font-bold hover:text-white/80 transition-colors"
      >
        Start your dog&apos;s free health check →
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SocialCtaBanner() {
  return (
    <Suspense fallback={null}>
      <BannerInner />
    </Suspense>
  );
}
