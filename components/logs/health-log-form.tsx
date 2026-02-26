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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PhotoUploader } from "@/components/pets/photo-uploader";

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

const logSchema = z.object({
  petId: z.string().min(1, "Select a pet."),
  date: z.string().min(1, "Select a date."),
  energyLevel: z.coerce.number().min(1).max(10),
  weight: z.coerce.number().min(0).optional(),
  appetite: z.string().optional(),
  mood: z.string().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  improvements: z.boolean().default(false),
});

type LogFormInput = z.input<typeof logSchema>;
type LogFormValues = z.output<typeof logSchema>;

type HealthLogFormProps = {
  pets: { id: string; name: string }[];
  defaultPetId?: string;
};

export function HealthLogForm({ pets, defaultPetId }: HealthLogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<LogFormInput, unknown, LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      petId: defaultPetId ?? "",
      date: new Date().toISOString().split("T")[0],
      energyLevel: 7,
      weight: undefined,
      appetite: "",
      mood: "",
      notes: "",
      photoUrl: "",
      improvements: false,
    },
  });

  const energyLevel = Number(form.watch("energyLevel") ?? 0);

  const onSubmit = async (values: LogFormValues) => {
    const response = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      toast({
        title: "Unable to save log",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Health log added",
      description: "Your daily log has been saved.",
    });

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="petId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pet</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="energyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Energy level: {energyLevel}</FormLabel>
              <FormControl>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={Number(field.value ?? 0)}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                  className="w-full accent-emerald-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
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
          <FormField
            control={form.control}
            name="appetite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appetite</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appetite" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mood</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Happy">Happy</SelectItem>
                    <SelectItem value="Calm">Calm</SelectItem>
                    <SelectItem value="Anxious">Anxious</SelectItem>
                    <SelectItem value="Tired">Tired</SelectItem>
                  </SelectContent>
                </Select>
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
                label="Progress photo"
                value={field.value}
                onChange={(url) => field.onChange(url)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any notable changes today?"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="improvements"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <FormLabel className="text-sm">
                Noticed improvements since last log
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" size="lg">
          Save log
        </Button>
      </form>
    </Form>
  );
}
