"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PhotoUploader } from "@/components/pets/photo-uploader";
import { trackMetaCustomEvent } from "@/lib/meta-events";
import { BREED_NAMES } from "@/lib/breed-data";

const symptomsOptions = [
  "Low energy",
  "Itching",
  "Joint stiffness",
  "Digestive issues",
  "Anxiety",
  "Dry coat",
  "Weight changes",
  "Allergies",
  "Thyroid medicine for low thyroid",
  "Bad breath",
  "Restlessness",
];

const CAT_BREEDS_AND_TYPES = [
  "Domestic Shorthair",
  "Domestic Longhair",
  "Domestic Medium Hair",
  "Tabby",
  "Tuxedo",
  "Calico",
  "Tortoiseshell",
  "Orange Tabby",
  "Black Cat",
  "White Cat",
  "Gray Cat",
  "Siamese",
  "Maine Coon",
  "Persian",
  "Ragdoll",
  "Bengal",
  "British Shorthair",
  "Abyssinian",
  "Sphynx",
  "Scottish Fold",
  "Russian Blue",
  "Birman",
  "Burmese",
  "Himalayan",
  "Norwegian Forest Cat",
  "Devon Rex",
  "Cornish Rex",
  "Exotic Shorthair",
  "Manx",
  "Savannah",
  "Turkish Angora",
  "Bombay",
  "Tonkinese",
  "Chartreux",
  "Snowshoe",
  "Mixed / Unknown",
];

function BreedAutocomplete({
  value,
  onChange,
  species,
}: {
  value: string;
  onChange: (v: string) => void;
  species: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const breedList = species === "cat" ? CAT_BREEDS_AND_TYPES : BREED_NAMES;
  const placeholder = species === "cat" ? "e.g. Tuxedo, Tabby, Siamese" : "e.g. Golden Retriever, Pomchi";

  const filtered = useCallback(() => {
    if (!query.trim()) return breedList.slice(0, 12);
    const q = query.toLowerCase();
    return breedList.filter((b) => b.toLowerCase().includes(q)).slice(0, 12);
  }, [query, breedList]);

  const suggestions = filtered();

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.map((breed) => (
            <li key={breed}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(breed);
                  onChange(breed);
                  setOpen(false);
                }}
              >
                {breed}
              </button>
            </li>
          ))}
        </ul>
      )}
      {species === "cat" && (
        <p className="mt-1 text-xs text-muted-foreground">
          Color, pattern, or breed all work — whatever best describes your cat
        </p>
      )}
    </div>
  );
}

function sanitizeWholeNumberInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

function sanitizeDecimalInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`;
}

function stripLeadingZeros(value: string) {
  if (value === "") return "";
  if (value.includes(".")) {
    const [whole, fraction] = value.split(".");
    const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
    return `${normalizedWhole || "0"}.${fraction ?? ""}`;
  }
  return value.replace(/^0+(?=\d)/, "");
}

const petSchema = z.object({
  name: z.string().min(1, "Pet name is required."),
  species: z.string().min(1).default("dog"),
  breed: z.string().min(1, "Breed is required."),
  age: z.coerce.number().int().min(0, "Age must be positive."),
  weight: z.coerce.number().min(0, "Weight must be positive."),
  symptoms: z.array(z.string()).default([]),
  photoUrl: z
    .string()
    .url("Provide a valid image URL.")
    .optional()
    .or(z.literal("")),
});

type PetFormInput = z.input<typeof petSchema>;
type PetFormValues = z.output<typeof petSchema>;

type PetFormProps = {
  mode: "create" | "edit";
  petId?: string;
  defaultValues?: Partial<PetFormValues>;
};

export function PetForm({ mode, petId, defaultValues }: PetFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<PetFormInput, unknown, PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      species: defaultValues?.species ?? "dog",
      breed: defaultValues?.breed ?? "",
      age: defaultValues?.age ?? ("" as unknown as number),
      weight: defaultValues?.weight ?? ("" as unknown as number),
      symptoms: defaultValues?.symptoms ?? [],
      photoUrl: defaultValues?.photoUrl ?? "",
    },
  });

  const currentSpecies = form.watch("species") ?? "dog";

  const onSubmit = async (values: PetFormValues) => {
    const response = await fetch(
      mode === "create" ? "/api/pets" : `/api/pets/${petId}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );

    if (!response.ok) {
      // Check for tier gate error (second dog limit)
      if (response.status === 403) {
        const errorData = await response.json();
        
        if (errorData.tierGate === "second-dog") {
          // Track tier gate hit
          void trackMetaCustomEvent("TierGate_SecondDog", {
            source: "second-dog",
            petName: values.name,
          });
          
          toast({
            title: "Upgrade to add more pets",
            description: "Free tier supports 1 pet profile. Upgrade to premium for unlimited pets.",
            variant: "destructive",
            action: (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void trackMetaCustomEvent("TierGate_SecondDog_Click", {
                    source: "second-dog",
                    petName: values.name,
                  });
                  router.push("/pricing?source=second-dog");
                }}
              >
                Upgrade
              </Button>
            ),
          });
          return;
        }
      }
      
      toast({
        title: "Unable to save pet",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: mode === "create" ? "Pet added!" : "Pet updated!",
      description: "Your pet profile has been saved.",
    });

    router.push("/pets");
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your pet's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue("breed", "");
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Dog or Cat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{currentSpecies === "cat" ? "Breed, color, or pattern" : "Breed"}</FormLabel>
              <FormControl>
                <BreedAutocomplete
                  value={field.value}
                  onChange={field.onChange}
                  species={currentSpecies}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name={field.name}
                    ref={field.ref}
                    onBlur={(event) => {
                      field.onChange(stripLeadingZeros(event.target.value));
                      field.onBlur();
                    }}
                    value={
                      typeof field.value === "number"
                        ? String(field.value)
                        : field.value
                          ? String(field.value)
                          : ""
                    }
                    onChange={(event) => field.onChange(sanitizeWholeNumberInput(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (lbs)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    name={field.name}
                    ref={field.ref}
                    onBlur={(event) => {
                      field.onChange(stripLeadingZeros(event.target.value));
                      field.onBlur();
                    }}
                    value={
                      typeof field.value === "number"
                        ? String(field.value)
                        : field.value
                          ? String(field.value)
                          : ""
                    }
                    onChange={(event) => field.onChange(sanitizeDecimalInput(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <PhotoUploader
                label="Pet photo"
                value={field.value}
                onChange={(url) => field.onChange(url)}
              />
              <FormControl>
                <Input placeholder="Or paste an image URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symptoms (multi-select)</FormLabel>
              <div className="grid gap-3 sm:grid-cols-2">
                {symptomsOptions.map((symptom) => (
                  <label
                    key={symptom}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={field.value?.includes(symptom)}
                      onCheckedChange={(checked) => {
                        const current = new Set(field.value);
                        if (checked === true) {
                          current.add(symptom);
                        } else {
                          current.delete(symptom);
                        }
                        field.onChange(Array.from(current));
                      }}
                    />
                    {symptom}
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg">
          {mode === "create" ? "Save Pet" : "Update Pet"}
        </Button>
      </form>
    </Form>
  );
}
