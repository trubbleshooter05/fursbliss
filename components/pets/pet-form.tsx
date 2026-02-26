"use client";

import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { PhotoUploader } from "@/components/pets/photo-uploader";

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
      breed: defaultValues?.breed ?? "",
      age: defaultValues?.age ?? 0,
      weight: defaultValues?.weight ?? 0,
      symptoms: defaultValues?.symptoms ?? [],
      photoUrl: defaultValues?.photoUrl ?? "",
    },
  });

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
                  <Input placeholder="Luna" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed</FormLabel>
                <FormControl>
                  <Input placeholder="Golden Retriever" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
