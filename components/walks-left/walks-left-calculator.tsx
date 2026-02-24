"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BREED_NAMES,
  getLifeExpectancyForBreed,
  type LifeExpectancyRange,
} from "@/lib/breed-data";
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-events";
import { ShareCard, type WalksLeftMetrics } from "@/components/walks-left/share-card";

type PrefillValues = {
  name?: string;
  breed?: string;
};

type WalksLeftResult = {
  dogName: string;
  breed: string;
  ageYears: number;
  ageMonths: number;
  weightLbs: number;
  expectancy: LifeExpectancyRange;
  remainingYears: number;
  metrics: WalksLeftMetrics;
  everyDayGift: boolean;
};

function ageLabel(years: number, months: number): string {
  const yearLabel = `${years} year${years === 1 ? "" : "s"}`;
  const monthLabel = `${months} month${months === 1 ? "" : "s"}`;
  return `${yearLabel}, ${monthLabel}`;
}

function fileSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "dog";
}

function drawGradientBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#2B134E");
  gradient.addColorStop(0.55, "#4A206D");
  gradient.addColorStop(1, "#D0643B");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function buildCardImageDataUrl(
  result: WalksLeftResult,
  format: "story" | "square"
): string {
  const width = 1080;
  const height = format === "story" ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  drawGradientBackground(ctx, width, height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
  ctx.beginPath();
  ctx.arc(180, 200, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.arc(width - 180, height - 220, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 44px system-ui";
  ctx.fillText("How Many Walks Left", 72, 120);

  ctx.font = "700 108px Georgia";
  ctx.fillText(result.dogName, 72, 250);

  ctx.font = "500 38px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(
    `${result.breed} • ${ageLabel(result.ageYears, result.ageMonths)}`,
    72,
    310
  );

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 72px system-ui";
  const lines = [
    `🐾 ${result.metrics.walksLeft.toLocaleString()} more walks`,
    `🌅 ${result.metrics.sunsetsLeft.toLocaleString()} more sunsets`,
    `🗓️ ${result.metrics.weekendsLeft.toLocaleString()} more weekends`,
  ];
  lines.forEach((line, index) => {
    ctx.fillText(line, 72, 470 + index * 108);
  });

  ctx.font = "500 38px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(
    `Based on average ${result.breed} life expectancy of ${result.expectancy.low}-${result.expectancy.high} years`,
    72,
    format === "story" ? 1650 : 880
  );

  ctx.font = "700 34px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("fursbliss.com/walks-left", 72, format === "story" ? 1760 : 960);
  return canvas.toDataURL("image/png");
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

export function WalksLeftCalculator({ prefill }: { prefill?: PrefillValues }) {
  const [dogName, setDogName] = useState(prefill?.name ?? "");
  const [breed, setBreed] = useState(prefill?.breed ?? "");
  const [ageYears, setAgeYears] = useState(8);
  const [ageMonths, setAgeMonths] = useState(0);
  const [weightLbs, setWeightLbs] = useState(45);
  const [result, setResult] = useState<WalksLeftResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSending, setWaitlistSending] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [completedTracked, setCompletedTracked] = useState(false);

  const filteredBreeds = useMemo(() => {
    const query = breed.trim().toLowerCase();
    if (!query) return BREED_NAMES.slice(0, 40);
    return BREED_NAMES.filter((item) => item.toLowerCase().includes(query)).slice(0, 40);
  }, [breed]);

  const dogNameForHeadline = dogName.trim() || "Your Dog";

  useEffect(() => {
    if (!result || completedTracked) return;
    void trackMetaCustomEvent("WalksLeftCompleted", {
      dog_name: result.dogName,
      breed: result.breed,
      walks_left: result.metrics.walksLeft,
    });
    setCompletedTracked(true);
  }, [completedTracked, result]);

  const onCalculate = async () => {
    setError(null);
    const normalizedName = dogName.trim();
    const normalizedBreed = breed.trim();
    if (!normalizedName || !normalizedBreed || !weightLbs || weightLbs <= 0) {
      setError("Please complete your dog's name, breed, age, and weight.");
      return;
    }

    await trackMetaCustomEvent("WalksLeftStarted", {
      dog_name: normalizedName,
      breed: normalizedBreed,
    });

    const expectancy = getLifeExpectancyForBreed(normalizedBreed, weightLbs);
    const currentAge = ageYears + ageMonths / 12;
    let remainingYears = Number((expectancy.mid - currentAge).toFixed(2));
    let everyDayGift = false;
    if (remainingYears < 0) {
      remainingYears = 0.5;
      everyDayGift = true;
    }

    const remainingDays = Math.round(remainingYears * 365);
    const metrics: WalksLeftMetrics = {
      walksLeft: Math.round(remainingDays * 1.5),
      weekendsLeft: Math.round(remainingYears * 52),
      sunsetsLeft: remainingDays,
      carRidesLeft: Math.round(remainingYears * 156),
      couchHoursLeft: Math.round(remainingDays * 5),
      heartbeatsMillions: Number(((remainingDays * 24 * 60 * 120) / 1_000_000).toFixed(1)),
      bellyRubsLeft: Math.round(remainingDays * 3),
      morningGreetingsLeft: remainingDays,
    };

    setResult({
      dogName: normalizedName,
      breed: normalizedBreed,
      ageYears,
      ageMonths,
      weightLbs,
      expectancy,
      remainingYears,
      metrics,
      everyDayGift,
    });
  };

  const shareUrl = useMemo(() => {
    if (!result) return "https://www.fursbliss.com/walks-left";
    const params = new URLSearchParams({
      name: result.dogName,
      breed: result.breed,
      walks: String(result.metrics.walksLeft),
    });
    return `https://www.fursbliss.com/walks-left?${params.toString()}`;
  }, [result]);

  const onShare = async (channel: "instagram" | "facebook" | "x" | "copy" | "download") => {
    if (!result) return;
    setShareFeedback(null);
    await trackMetaCustomEvent("WalksLeftShared", {
      channel,
      dog_name: result.dogName,
      walks_left: result.metrics.walksLeft,
    });

    if (channel === "instagram") {
      const dataUrl = buildCardImageDataUrl(result, "story");
      downloadDataUrl(dataUrl, `${fileSlug(result.dogName)}-walks-left-story.png`);
      setShareFeedback("Story image generated. If prompted, tap Download.");
      return;
    }

    if (channel === "download") {
      const dataUrl = buildCardImageDataUrl(result, "square");
      const filename = `${fileSlug(result.dogName)}-walks-left-feed.png`;
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: "image/png" });
        const canShareFiles =
          typeof navigator !== "undefined" &&
          "share" in navigator &&
          "canShare" in navigator &&
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [file] });

        if (canShareFiles) {
          await navigator.share({
            files: [file],
            title: `${result.dogName}'s Walks Left card`,
            text: "Save or share this card.",
          });
          setShareFeedback("Opened share sheet. Choose Save Image.");
          return;
        }
      } catch {
        // Continue with fallback download/open flow.
      }

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        const popup = window.open(dataUrl, "_blank", "noopener,noreferrer");
        if (!popup) {
          downloadDataUrl(dataUrl, filename);
        }
        setShareFeedback("Opened image preview. Long-press image to Save to Photos.");
      } else {
        downloadDataUrl(dataUrl, filename);
        setShareFeedback("Card downloaded.");
      }
      return;
    }

    if (channel === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (channel === "x") {
      const text = `I have ${result.metrics.walksLeft.toLocaleString()} walks left with ${result.dogName}. Find out yours: ${shareUrl}`;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback("Link copied.");
        return;
      }
      throw new Error("Clipboard API unavailable");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      const didCopy = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (didCopy) {
        setShareFeedback("Link copied.");
        return;
      }

      if (navigator.share) {
        await navigator.share({ title: "Walks Left", url: shareUrl });
        setShareFeedback("Opened share sheet.");
        return;
      }

      window.prompt("Copy this link:", shareUrl);
      setShareFeedback("Copy the link from the prompt.");
    }
  };

  const onSubmitWaitlist = async () => {
    if (!result) return;
    setWaitlistError(null);
    const email = waitlistEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      setWaitlistError("Enter a valid email.");
      return;
    }

    setWaitlistSending(true);
    try {
      const response = await fetch("/api/walks-left/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "walks-left",
          dogName: result.dogName,
          breed: result.breed,
          ageYears: result.ageYears,
          ageMonths: result.ageMonths,
          metrics: result.metrics,
          expectancy: result.expectancy,
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload?.ok !== true) {
        throw new Error(payload?.message ?? "Unable to join updates.");
      }

      await trackMetaEvent("Lead", {
        content_name: "walks_left_report_capture",
        dog_name: result.dogName,
      });
      setWaitlistSuccess(true);
      setWaitlistEmail(email);
    } catch (submitError) {
      setWaitlistError(
        submitError instanceof Error ? submitError.message : "Unable to join updates."
      );
    } finally {
      setWaitlistSending(false);
    }
  };

  const bonusYears = 1.5;
  const bonusDays = Math.round(bonusYears * 365);
  const bonusWalks = Math.round(bonusDays * 1.5);
  const bonusWeekends = Math.round(bonusYears * 52);
  const bonusSunsets = bonusDays;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#3d1a5e_0%,#1d0f2f_40%,#12091f_100%)] text-white">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.section
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="min-h-[88vh] rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur md:p-8"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/75">Free emotional calculator</p>
              <h1 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">
                How Many Walks Do You Have Left With {dogNameForHeadline}?
              </h1>
              <p className="mt-3 text-white/85">
                Find out exactly how much time you have left to make every moment count.
              </p>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Dog&apos;s name</label>
                  <Input
                    value={dogName}
                    onChange={(event) => setDogName(event.target.value)}
                    placeholder="e.g. Bella"
                    className="border-white/20 bg-black/20 text-white placeholder:text-white/55"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Breed</label>
                  <Input
                    value={breed}
                    onChange={(event) => setBreed(event.target.value)}
                    placeholder="Search breed..."
                    className="border-white/20 bg-black/20 text-white placeholder:text-white/55"
                  />
                  <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl border border-white/15 bg-black/20 p-2">
                    {filteredBreeds.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                          item === breed
                            ? "bg-white/20 text-white"
                            : "text-white/85 hover:bg-white/10"
                        }`}
                        onClick={() => setBreed(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Age (years)</label>
                    <select
                      value={ageYears}
                      onChange={(event) => setAgeYears(Number(event.target.value))}
                      className="h-11 w-full rounded-md border border-white/20 bg-black/20 px-3 text-white"
                    >
                      {Array.from({ length: 21 }, (_, i) => i).map((year) => (
                        <option key={year} value={year} className="text-black">
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Age (months)</label>
                    <select
                      value={ageMonths}
                      onChange={(event) => setAgeMonths(Number(event.target.value))}
                      className="h-11 w-full rounded-md border border-white/20 bg-black/20 px-3 text-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                        <option key={month} value={month} className="text-black">
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Weight (lbs)</label>
                  <Input
                    type="number"
                    min={1}
                    value={weightLbs}
                    onChange={(event) => setWeightLbs(Number(event.target.value || 0))}
                    className="border-white/20 bg-black/20 text-white placeholder:text-white/55"
                  />
                </div>

                <Button
                  onClick={onCalculate}
                  className="min-h-12 w-full bg-[#ff8b5b] text-black hover:brightness-110"
                >
                  See Your Time Together
                </Button>
                {error ? <p className="text-sm text-rose-300">{error}</p> : null}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden border-white/20 bg-transparent text-white">
                <CardHeader>
                  <CardTitle className="font-display text-4xl tracking-[-0.03em] md:text-5xl">
                    {result.dogName}
                  </CardTitle>
                  <p className="text-sm text-white/80">
                    {result.breed} • {ageLabel(result.ageYears, result.ageMonths)}
                  </p>
                  {result.everyDayGift ? (
                    <p className="text-sm text-amber-200">
                      Every day is a gift. This estimate uses a gentle 6-month runway so you can focus on the moments ahead.
                    </p>
                  ) : null}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-xl md:text-2xl">
                    {[
                      `🐾 ${result.metrics.walksLeft.toLocaleString()} more walks with ${result.dogName}`,
                      `🌅 ${result.metrics.sunsetsLeft.toLocaleString()} more sunsets together`,
                      `🗓️ ${result.metrics.weekendsLeft.toLocaleString()} more weekends`,
                      `🚗 ${result.metrics.carRidesLeft.toLocaleString()} more car rides`,
                      `🛋️ ${result.metrics.couchHoursLeft.toLocaleString()} more hours on the couch together`,
                      `💓 ${result.metrics.heartbeatsMillions.toFixed(1)} million more heartbeats`,
                    ].map((line, index) => (
                      <motion.p
                        key={line}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.5, duration: 0.35 }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-white/75">
                    Based on average {result.breed} life expectancy of {result.expectancy.low}-{result.expectancy.high} years.
                  </p>
                </CardContent>
              </Card>

              <ShareCard
                dogName={result.dogName}
                breed={result.breed}
                ageLabel={ageLabel(result.ageYears, result.ageMonths)}
                metrics={result.metrics}
                expectancy={result.expectancy}
              />

              <Card className="border-white/20 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Share your card</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button className="min-h-11 w-full" onClick={() => onShare("instagram")}>
                    Save Story Image (IG)
                  </Button>
                  <Button className="min-h-11 w-full" variant="secondary" onClick={() => onShare("facebook")}>
                    Share to Facebook
                  </Button>
                  <Button className="min-h-11 w-full" variant="secondary" onClick={() => onShare("x")}>
                    Share to Twitter/X
                  </Button>
                  <Button className="min-h-11 w-full" variant="secondary" onClick={() => onShare("copy")}>
                    Copy Link
                  </Button>
                  <Button
                    className="min-h-11 w-full border-white/35 bg-white text-[#2B134E] hover:bg-white/90"
                    variant="outline"
                    onClick={() => onShare("download")}
                  >
                    Save Feed Image
                  </Button>
                  <p className="text-center text-xs text-white/70">
                    iPhone: tap Save Image, then post from Instagram.
                  </p>
                  {shareFeedback ? (
                    <p className="text-center text-sm text-emerald-300">{shareFeedback}</p>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="border-white/20 bg-white/5 text-white">
                <CardHeader className="space-y-2">
                  <CardTitle className="font-display text-3xl">What if you could add more?</CardTitle>
                  <p className="text-sm text-white/85">
                    LOY-002, the first FDA-reviewed dog longevity drug, could extend your dog&apos;s healthy lifespan by 1-2 years.
                  </p>
                  <p className="text-sm font-semibold text-amber-200">
                    That&apos;s {bonusWalks.toLocaleString()} more walks. {bonusWeekends.toLocaleString()} more weekends. {bonusSunsets.toLocaleString()} more sunsets.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border border-white/15 bg-black/20 p-4">
                    <p className="text-base font-semibold">
                      Get {result.dogName}&apos;s personalized longevity report
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      Plus LOY-002 milestone alerts so you&apos;re ready when it launches.
                    </p>
                    <div className="mt-3 space-y-2">
                      <Input
                        type="email"
                        value={waitlistEmail}
                        onChange={(event) => setWaitlistEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="border-white/20 bg-black/20 text-white placeholder:text-white/55"
                      />
                      <Button
                        className="min-h-11 w-full bg-[#ff8b5b] text-black hover:brightness-110"
                        onClick={onSubmitWaitlist}
                        disabled={waitlistSending || waitlistSuccess}
                      >
                        {waitlistSuccess ? "Sent" : waitlistSending ? "Sending..." : "Send My Report"}
                      </Button>
                      {waitlistSuccess ? (
                        <p className="text-sm text-emerald-300">Check your inbox for your personalized report.</p>
                      ) : null}
                      {waitlistError ? <p className="text-sm text-rose-300">{waitlistError}</p> : null}
                    </div>
                  </div>

                  <Button asChild className="h-auto min-h-11 w-full whitespace-normal px-4 py-3 text-center leading-snug">
                    <Link href="/quiz">
                      Take the full longevity quiz → get {result.dogName}&apos;s readiness score
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto min-h-11 w-full whitespace-normal border-white/35 bg-white px-4 py-3 text-center leading-snug text-[#2B134E] hover:bg-white/90"
                  >
                    <Link href="/signup">
                      Create a free account to track {result.dogName}&apos;s health over time
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
