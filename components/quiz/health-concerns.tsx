"use client";

import { Button } from "@/components/ui/button";

type HealthConcernsProps = {
  dogName: string;
  selected: string[];
  onToggle: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
};

const CONCERN_OPTIONS = [
  { id: "joint_mobility", label: "Joint stiffness / mobility" },
  { id: "energy", label: "Low energy / slowing down" },
  { id: "weight", label: "Weight concerns" },
  { id: "digestive", label: "Digestive issues" },
  { id: "cognitive", label: "Cognitive changes / confusion" },
  { id: "none", label: "None — seems healthy!" },
] as const;

export function HealthConcerns({
  dogName,
  selected,
  onToggle,
  onSubmit,
  submitting,
}: HealthConcernsProps) {
  const hasAny = selected.length > 0;

  return (
    <div className="space-y-4">
      <p className="text-base font-semibold text-foreground">
        Any concerns about {dogName}? (Select all that apply)
      </p>
      <div className="grid gap-2">
        {CONCERN_OPTIONS.map((option) => {
          const active = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className={`min-h-12 rounded-xl border px-4 py-3 text-left text-base transition duration-200 ${
                active
                  ? "scale-[1.02] border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary/60"
              }`}
            >
              {option.label.replace("seems", dogName)}
            </button>
          );
        })}
      </div>

      <Button
        className={`min-h-12 w-full text-base transition ${
          hasAny
            ? "bg-accent text-accent-foreground hover:brightness-110"
            : "border border-border bg-background text-foreground"
        }`}
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? "Preparing..." : "Get My Score →"}
      </Button>
    </div>
  );
}
