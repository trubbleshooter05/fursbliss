"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UrgentAnswerCta } from "@/components/site/urgent-answer-cta";
import { SymptomUrgentUpsell } from "@/components/site/symptom-urgent-upsell";
import { SymptomAffiliatePicks } from "@/components/site/affiliate-links";
import { computeSymptomSeverityScore, shouldShowUrgentUpsell } from "@/lib/symptom-severity";

type MainSymptom =
  | "vomiting"
  | "vomiting-white-foam"
  | "diarrhea"
  | "not-eating"
  | "coughing"
  | "limping"
  | "shaking"
  | "excessive-thirst"
  | "itching"
  | "ear-issues"
  | "eye-issues"
  | "breathing"
  | "breathing-rest"
  | "toxin"
  | "choking"
  | "lethargy"
  | "weight-loss"
  | "fever"
  | "other";

type Duration = "just-started" | "hours" | "12-24h" | "more-than-24h";
type ActingNormal = "yes" | "no" | "unsure";
type AgeGroup = "puppy" | "adult" | "senior";
type Severity = "mild" | "moderate" | "severe";

type Outcome = "emergency" | "vet-soon" | "monitor";

type RedFlags = {
  breathing: boolean;
  collapse: boolean;
  repeatedVomiting: boolean;
  toxin: boolean;
  choking: boolean;
  severeLethargy: boolean;
};

const initialRed: RedFlags = {
  breathing: false,
  collapse: false,
  repeatedVomiting: false,
  toxin: false,
  choking: false,
  severeLethargy: false,
};

function computeOutcome(
  red: RedFlags,
  severity: Severity,
  duration: Duration,
  acting: ActingNormal,
  age: AgeGroup
): Outcome {
  if (red.breathing || red.collapse || red.toxin || red.choking) return "emergency";
  if (red.repeatedVomiting || red.severeLethargy) return "emergency";
  if (severity === "severe") return "emergency";
  if (severity === "moderate" && (acting === "no" || duration === "more-than-24h")) return "vet-soon";
  if (acting === "no" && (duration === "12-24h" || duration === "more-than-24h")) return "vet-soon";
  if (age === "puppy" && (acting === "no" || severity !== "mild")) return "vet-soon";
  if (age === "senior" && severity === "moderate") return "vet-soon";
  if (severity === "moderate") return "vet-soon";
  return "monitor";
}

function symptomGuideHref(main: MainSymptom): string {
  switch (main) {
    case "vomiting": return "/symptoms/vomiting";
    case "vomiting-white-foam": return "/symptoms/vomiting-white-foam";
    case "diarrhea": return "/symptoms/vomiting";
    case "not-eating": return "/symptoms/should-i-go-to-the-vet";
    case "coughing": return "/symptoms/should-i-go-to-the-vet";
    case "limping": return "/symptoms/should-i-go-to-the-vet";
    case "shaking": return "/symptoms/should-i-go-to-the-vet";
    case "excessive-thirst": return "/symptoms/should-i-go-to-the-vet";
    case "itching": return "/symptoms/should-i-go-to-the-vet";
    case "ear-issues": return "/symptoms/should-i-go-to-the-vet";
    case "eye-issues": return "/symptoms/should-i-go-to-the-vet";
    case "weight-loss": return "/symptoms/should-i-go-to-the-vet";
    case "breathing": return "/symptoms/breathing-heavy";
    case "breathing-rest": return "/symptoms/rapid-breathing-at-rest";
    case "toxin": return "/symptoms/ate-chocolate";
    case "choking": return "/symptoms/choking";
    case "lethargy": return "/symptoms/should-i-go-to-the-vet";
    case "fever": return "/symptoms/fever";
    default: return "/symptoms/should-i-go-to-the-vet";
  }
}

function symptomGuideLinkLabel(main: MainSymptom): string {
  switch (main) {
    case "vomiting": return "Open the vomiting & stomach upset guide";
    case "vomiting-white-foam": return "Open the white foam vomiting guide";
    case "diarrhea": return "Open the digestive upset guide";
    case "not-eating": return "Open the appetite & urgency guide";
    case "coughing": return "Open the coughing & breathing guide";
    case "limping": return "Open the pain & mobility guide";
    case "shaking": return "Open the trembling & shaking guide";
    case "excessive-thirst": return "Open the thirst & urinary guide";
    case "itching": return "Open the skin & allergy guide";
    case "ear-issues": return "Open the ear health guide";
    case "eye-issues": return "Open the eye health guide";
    case "weight-loss": return "Open the weight & nutrition guide";
    case "breathing": return "Open the breathing & panting guide";
    case "breathing-rest": return "Open the rapid breathing at rest guide";
    case "toxin": return "Open the suspected poisoning guide";
    case "choking": return "Open the choking guide";
    case "lethargy": return "Open the “should I go to the vet?” guide";
    case "fever": return "Open the fever guide";
    default: return "Open the general urgency guide";
  }
}

const DURATION_SUMMARY: Record<Duration, string> = {
  "just-started": "Just started",
  hours: "A few hours",
  "12-24h": "About 12–24 hours",
  "more-than-24h": "More than 24 hours",
};

const RED_FLAG_SUMMARY: Record<keyof RedFlags, string> = {
  breathing: "trouble breathing / distress",
  collapse: "collapse or can’t stand",
  repeatedVomiting: "repeated vomiting or retching",
  toxin: "suspected toxin",
  choking: "possible choking",
  severeLethargy: "severe lethargy",
};

export function EmergencyChecker() {
  const [main, setMain] = useState<MainSymptom>("vomiting");
  const [duration, setDuration] = useState<Duration>("hours");
  const [acting, setActing] = useState<ActingNormal>("unsure");
  const [age, setAge] = useState<AgeGroup>("adult");
  const [severity, setSeverity] = useState<Severity>("mild");
  const [red, setRed] = useState<RedFlags>(initialRed);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const severityScore = useMemo(
    () => computeSymptomSeverityScore(severity, red),
    [severity, red]
  );

  const summary = useMemo(() => {
    const concernLine =
      {
        vomiting: "Main concern: Vomiting / stomach upset",
        "vomiting-white-foam": "Main concern: Vomiting white foam",
        diarrhea: "Main concern: Diarrhea / loose stools",
        "not-eating": "Main concern: Not eating / loss of appetite",
        coughing: "Main concern: Coughing / gagging / honking",
        limping: "Main concern: Limping / favoring a leg",
        shaking: "Main concern: Shaking / trembling",
        "excessive-thirst": "Main concern: Drinking much more water than usual",
        itching: "Main concern: Itching / scratching / skin irritation",
        "ear-issues": "Main concern: Ear problems — head shaking, odor, discharge",
        "eye-issues": "Main concern: Eye problems — discharge, redness, squinting",
        "weight-loss": "Main concern: Noticeable weight loss",
        breathing: "Main concern: Breathing looks off / panting",
        "breathing-rest": "Main concern: Fast breathing while at rest",
        fever: "Main concern: Fever / very hot to touch / shivering",
        toxin: "Main concern: Suspected poisoning / dangerous substance",
        choking: "Main concern: Choking / gagging",
        lethargy: "Main concern: Very low energy / won’t get up",
        other: "Main concern: Other / not listed above",
      }[main] ?? `Main concern: ${main}`;

    const band =
      outcome === "emergency"
        ? "Suggested band: Emergency — contact a vet now"
        : outcome === "vet-soon"
          ? "Suggested band: Vet soon — book a visit soon"
          : "Suggested band: Monitor — watch closely";

    const redSummary =
      Object.entries(red)
        .filter((e): e is [keyof RedFlags, boolean] => e[1])
        .map(([k]) => RED_FLAG_SUMMARY[k])
        .join(", ") || "none";

    const lines = [
      "FursBliss — vet-ready summary (informational only; not a diagnosis)",
      concernLine,
      `How long: ${DURATION_SUMMARY[duration]}`,
      `Otherwise acting normal: ${acting}`,
      `Age: ${age}`,
      `How severe it seems: ${severity}`,
      `Red flags checked: ${redSummary}`,
      outcome ? band : "",
    ];
    return lines.filter(Boolean).join("\n");
  }, [acting, age, duration, main, outcome, red, severity]);

  function runCheck() {
    setOutcome(computeOutcome(red, severity, duration, acting, age));
  }

  function reset() {
    setOutcome(null);
    setRed(initialRed);
  }

  return (
    <div className="space-y-8">
      {!outcome ? (
        <Card className="rounded-2xl border-border">
          <CardContent className="space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium text-foreground">What symptom are you seeing?</label>
              <select
                className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-base"
                value={main}
                onChange={(e) => setMain(e.target.value as MainSymptom)}
              >
                <optgroup label="Digestive">
                  <option value="vomiting">Vomiting / stomach upset</option>
                  <option value="vomiting-white-foam">Vomiting white foam</option>
                  <option value="diarrhea">Diarrhea / loose stools</option>
                  <option value="not-eating">Not eating / loss of appetite</option>
                </optgroup>
                <optgroup label="Movement &amp; Behaviour">
                  <option value="limping">Limping / favoring a leg</option>
                  <option value="shaking">Shaking / trembling</option>
                  <option value="lethargy">Very low energy / won’t get up</option>
                  <option value="coughing">Coughing / gagging / honking sound</option>
                </optgroup>
                <optgroup label="Skin, Ears &amp; Eyes">
                  <option value="itching">Itching / scratching / skin irritation</option>
                  <option value="ear-issues">Ear problems — head shaking, odor, discharge</option>
                  <option value="eye-issues">Eye problems — discharge, redness, squinting</option>
                </optgroup>
                <optgroup label="Eating &amp; Weight">
                  <option value="excessive-thirst">Drinking much more water than usual</option>
                  <option value="weight-loss">Noticeable weight loss</option>
                </optgroup>
                <optgroup label="Urgent / Emergency">
                  <option value="breathing">Breathing looks off / panting heavily</option>
                  <option value="breathing-rest">Fast breathing at rest (not exercising)</option>
                  <option value="fever">Fever / very hot to touch / shivering</option>
                  <option value="toxin">Suspected poisoning / ate something dangerous</option>
                  <option value="choking">Choking / gagging on object</option>
                </optgroup>
                <option value="other">Something else not listed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">How long has this been happening?</label>
              <select
                className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-base"
                value={duration}
                onChange={(e) => setDuration(e.target.value as Duration)}
              >
                <option value="just-started">Just started</option>
                <option value="hours">A few hours</option>
                <option value="12-24h">About 12–24 hours</option>
                <option value="more-than-24h">More than 24 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Acting normal otherwise?</label>
              <select
                className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-base"
                value={acting}
                onChange={(e) => setActing(e.target.value as ActingNormal)}
              >
                <option value="yes">Mostly yes</option>
                <option value="no">No / clearly off</option>
                <option value="unsure">Not sure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Age group</label>
              <select
                className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-base"
                value={age}
                onChange={(e) => setAge(e.target.value as AgeGroup)}
              >
                <option value="puppy">Puppy</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">How bad does it seem right now?</label>
              <select
                className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-base"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            <fieldset className="rounded-lg border border-border p-4">
              <legend className="text-sm font-medium text-foreground">Any red flags?</legend>
              <p className="mt-1 text-xs text-muted-foreground">Check all that apply.</p>
              <div className="mt-3 space-y-2 text-sm text-foreground">
                {(
                  [
                    ["breathing", "Trouble breathing / blue gums / constant distress"],
                    ["collapse", "Collapse, seizure-like episode, or can’t stand"],
                    ["repeatedVomiting", "Repeated vomiting or retching"],
                    ["toxin", "Suspected toxin or unknown substance"],
                    ["choking", "Possible choking / object in throat"],
                    ["severeLethargy", "Severe lethargy (won’t respond, very weak)"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={red[key]}
                      onChange={(e) => setRed((r) => ({ ...r, [key]: e.target.checked }))}
                      className="mt-1"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Button type="button" onClick={runCheck} className="w-full min-h-11">
              Check Symptoms Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <ResultPanel
            outcome={outcome}
            guideHref={symptomGuideHref(main)}
            guideLabel={symptomGuideLinkLabel(main)}
            summary={summary}
          />
          {shouldShowUrgentUpsell(severityScore) ? (
            <SymptomUrgentUpsell source="check-severity" />
          ) : (
            <UrgentAnswerCta source="check-result" variant="post-check" />
          )}
          <SymptomAffiliatePicks />
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  outcome,
  guideHref,
  guideLabel,
  summary,
}: {
  outcome: Outcome;
  guideHref: string;
  guideLabel: string;
  summary: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this summary:", summary);
    }
  }

  const reassurance = (
    <p className="text-xs leading-snug text-muted-foreground">
      This is based on common patterns. If symptoms worsen, contact a vet.
    </p>
  );

  const summaryBlock = (
    <div className="space-y-3 border-t border-border/80 pt-4">
      <h3 className="text-sm font-semibold text-foreground">Vet-ready summary</h3>
      <p className="text-xs text-muted-foreground">No login required—tap once to copy, then paste to your clinic.</p>
      <textarea
        readOnly
        className="h-36 w-full resize-y rounded-lg border border-input bg-background p-3 text-xs leading-relaxed"
        value={summary}
      />
      <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={copySummary}>
        {copied ? "Copied — tap to copy again" : "Generate vet-ready summary"}
      </Button>
      {copied ? <p className="text-xs font-medium text-emerald-800">Ready to paste into email or chat.</p> : null}
    </div>
  );

  if (outcome === "emergency") {
    return (
      <Card className="rounded-2xl border-rose-200 bg-rose-50">
        <CardContent className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">Emergency</p>
          <h2 className="text-xl font-bold text-rose-950">Emergency — contact a vet now</h2>
          <p className="text-sm leading-snug text-rose-900/90">
            Your answers line up with situations where most owners are told to seek help right away—especially when
            breathing, consciousness, severe distress, or possible poisoning could be involved. This app
            doesn&apos;t examine your dog or measure vitals, so in-person care is the reliable next step.
          </p>
          <div>
            <h3 className="text-sm font-semibold text-rose-950">What to do next</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-snug text-rose-900/90">
              <li>Call the nearest emergency clinic or your vet&apos;s on-call line now.</li>
              <li>If your dog is choking, collapsing, or struggling to breathe, head in—call en route if someone can.</li>
              <li>Bring packaging, plant samples, or photos if a toxin is possible.</li>
            </ul>
          </div>
          <Button asChild variant="outline" className="min-h-11 w-full border-rose-300 bg-white/80 sm:w-auto">
            <Link href={guideHref}>{guideLabel} →</Link>
          </Button>
          {summaryBlock}
          {reassurance}
        </CardContent>
      </Card>
    );
  }

  if (outcome === "vet-soon") {
    return (
      <Card className="rounded-2xl border-amber-200 bg-amber-50">
        <CardContent className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">Vet soon</p>
          <h2 className="text-xl font-bold text-amber-950">Vet soon — book a visit soon</h2>
          <p className="text-sm leading-snug text-amber-950/90">
            Your answers usually aren&apos;t a &quot;wait and see for days&quot; pattern for most dogs. Many clinics
            would suggest same-day or next-day contact so a professional can hear your timeline and decide if your
            dog should be seen sooner.
          </p>
          <div>
            <h3 className="text-sm font-semibold text-amber-950">What to do next</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-snug text-amber-950/90">
              <li>Call your vet with when it started, how often it happens, and anything your dog ate or chewed.</li>
              <li>Jot down notes or a short video clip—details get fuzzy on the phone.</li>
              <li>While you wait, avoid new treats or meds unless your vet okays them.</li>
            </ul>
          </div>
          <Button asChild variant="outline" className="min-h-11 w-full border-amber-300 bg-white/80 sm:w-auto">
            <Link href={guideHref}>{guideLabel} →</Link>
          </Button>
          {summaryBlock}
          {reassurance}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-emerald-200 bg-emerald-50">
      <CardContent className="space-y-4 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">Monitor</p>
        <h2 className="text-xl font-bold text-emerald-950">Monitor — watch closely and re-check</h2>
        <p className="text-sm leading-snug text-emerald-950/90">
          From what you shared, careful watching at home can be reasonable if your dog stays stable—but dogs can
          change quickly. Calling your vet for reassurance is still a good option; this result is educational, not a
          guarantee that everything is fine.
        </p>
        <div>
          <h3 className="text-sm font-semibold text-emerald-950">What to do next</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-snug text-emerald-950/90">
            <li>Recheck energy, breathing, gum color, appetite, and vomiting on a simple schedule.</li>
            <li>Pause new foods or chews until you&apos;re sure things are steady.</li>
            <li>If anything moves toward your red-flag list, run this checker again or call a vet.</li>
          </ul>
        </div>
        <Button asChild variant="outline" className="min-h-11 w-full border-emerald-300 bg-white/80 sm:w-auto">
          <Link href={guideHref}>{guideLabel} →</Link>
        </Button>
        {summaryBlock}
        {reassurance}
      </CardContent>
    </Card>
  );
}
