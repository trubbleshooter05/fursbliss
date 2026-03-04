"use client";

type AgeOption = {
  id: string;
  label: string;
};

type SizeOption = {
  id: string;
  label: string;
};

type AgeSizeCardsProps = {
  dogName: string;
  ageValue: string;
  sizeValue: string;
  onSelectAge: (value: string) => void;
  onSelectSize: (value: string) => void;
};

const AGE_OPTIONS: AgeOption[] = [
  { id: "under_3", label: "Under 3" },
  { id: "3_6", label: "3-6 years" },
  { id: "7_10", label: "7-10 years" },
  { id: "11_plus", label: "11+ years" },
];

const SIZE_OPTIONS: SizeOption[] = [
  { id: "small", label: "Small (<25 lbs)" },
  { id: "medium", label: "Medium (25-50 lbs)" },
  { id: "large", label: "Large (50-90 lbs)" },
  { id: "xl", label: "XL (90+ lbs)" },
];

function SelectCard({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-xl border px-4 py-3 text-left text-base transition duration-200 ${
        active
          ? "scale-[1.02] border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:border-primary/60"
      }`}
    >
      {label}
    </button>
  );
}

export function AgeSizeCards({
  dogName,
  ageValue,
  sizeValue,
  onSelectAge,
  onSelectSize,
}: AgeSizeCardsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">How old is {dogName}?</p>
        <div className="grid gap-2">
          {AGE_OPTIONS.map((option) => (
            <SelectCard
              key={option.id}
              active={ageValue === option.id}
              onClick={() => onSelectAge(option.id)}
              label={option.label}
            />
          ))}
        </div>
      </div>

      {ageValue ? (
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">How big is {dogName}?</p>
          <div className="grid gap-2">
            {SIZE_OPTIONS.map((option) => (
              <SelectCard
                key={option.id}
                active={sizeValue === option.id}
                onClick={() => onSelectSize(option.id)}
                label={option.label}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
