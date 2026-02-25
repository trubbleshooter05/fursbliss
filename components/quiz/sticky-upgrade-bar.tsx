"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackMetaCustomEvent } from "@/lib/meta-events";

type StickyUpgradeBarProps = {
  dogName: string;
  ctaHref: string;
  targetId: string;
};

export function StickyUpgradeBar({ dogName, ctaHref, targetId }: StickyUpgradeBarProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setShow(!entry?.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-8px_30px_-20px_rgba(0,0,0,0.5)] backdrop-blur md:hidden">
      <Button
        asChild
        className="min-h-12 w-full bg-accent text-accent-foreground"
        onClick={() => void trackMetaCustomEvent("ClickedUpgrade", { source: "sticky_upgrade_bar" })}
      >
        <a href={ctaHref}>Start {dogName}&apos;s Plan — 7-day trial</a>
      </Button>
    </div>
  );
}
