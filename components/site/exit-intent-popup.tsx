"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { trackMetaEvent } from "@/lib/meta-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EXIT_INTENT_SUBMITTED_KEY = "fursbliss_exit_intent_submitted";
const EXIT_INTENT_DISMISSED_AT_KEY = "fursbliss_exit_intent_dismissed_at";
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const TRIGGER_DELAY_MS = 8000;

const BLOCKED_PREFIXES = [
  "/dashboard",
  "/account",
  "/pets",
  "/insights",
  "/referrals",
  "/interaction-checker",
  "/admin",
  "/vet-view",
];
const BLOCKED_PATHS = new Set([
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

function canShowOnPath(pathname: string) {
  if (BLOCKED_PATHS.has(pathname)) return false;
  return !BLOCKED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function ExitIntentPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReadyToTrigger, setIsReadyToTrigger] = useState(false);
  const [shouldSuppress, setShouldSuppress] = useState(true);

  const isEligiblePage = useMemo(() => canShowOnPath(pathname), [pathname]);

  useEffect(() => {
    if (!isEligiblePage) {
      setOpen(false);
      return;
    }

    let hideTimer: number | undefined;

    try {
      const hasSubmitted = localStorage.getItem(EXIT_INTENT_SUBMITTED_KEY) === "1";
      const dismissedAtRaw = localStorage.getItem(EXIT_INTENT_DISMISSED_AT_KEY);
      const dismissedAt = dismissedAtRaw ? Number.parseInt(dismissedAtRaw, 10) : 0;
      const inCooldown = Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
      setShouldSuppress(hasSubmitted || inCooldown);
    } catch {
      setShouldSuppress(false);
    }

    setIsReadyToTrigger(false);
    hideTimer = window.setTimeout(() => {
      setIsReadyToTrigger(true);
    }, TRIGGER_DELAY_MS);

    return () => {
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
    };
  }, [isEligiblePage, pathname]);

  useEffect(() => {
    if (!isEligiblePage || shouldSuppress || !isReadyToTrigger) return;

    const onMouseOut = (event: MouseEvent) => {
      if (open) return;
      if (event.relatedTarget !== null) return;
      if (event.clientY > 0) return;
      setOpen(true);
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [isEligiblePage, open, shouldSuppress, isReadyToTrigger]);

  const onOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !success) {
      try {
        localStorage.setItem(EXIT_INTENT_DISMISSED_AT_KEY, String(Date.now()));
      } catch {
        // Ignore persistence failures.
      }
      setShouldSuppress(true);
    }
    setOpen(nextOpen);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/waitlist/loy002", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "loy002" }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || "Unable to save your request right now.");
      }

      setSuccess(true);
      setEmail("");
      setShouldSuppress(true);
      localStorage.setItem(EXIT_INTENT_SUBMITTED_KEY, "1");
      localStorage.removeItem(EXIT_INTENT_DISMISSED_AT_KEY);
      void trackMetaEvent("Lead", { content_name: "exit_intent_waitlist_capture" });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save your request right now."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isEligiblePage) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="font-display text-2xl">
            Before you go, get LOY-002 alerts
          </DialogTitle>
          <DialogDescription>
            Most visitors leave without hearing when approval milestones move. Drop your email and
            we will send major LOY-002 updates.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              You are on the list. We will email you the major LOY-002 milestones.
            </p>
            <Button className="w-full" asChild>
              <Link href="/signup">Create your free account</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Notify me"}
            </Button>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
