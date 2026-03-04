"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

type WeeklyCheckInFormProps = {
  petId: string;
  petName: string;
  dogBreed: string;
  weekStartDate: string;
  weekNumber: number;
};

export function WeeklyCheckInForm({
  petId,
  petName,
  dogBreed,
  weekStartDate,
  weekNumber,
}: WeeklyCheckInFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    newSymptoms: false,
    symptomDetails: "",
    energyLevel: "same" as "better" | "same" | "worse",
    appetite: "same" as "better" | "same" | "worse",
    vetVisit: false,
    vetVisitDetails: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/weekly-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          weekStartDate,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save check-in");
      }

      setSubmitted(true);
      
      // Redirect to results page after 2 seconds
      setTimeout(() => {
        router.push(`/weekly-checkin/${petId}/results?week=${weekStartDate}`);
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to save check-in. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        <h2 className="font-display text-2xl font-bold text-foreground">
          Check-In Saved!
        </h2>
        <p className="text-muted-foreground">
          Comparing {petName}'s week to last week...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span>Week {weekNumber} Check-In</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          How was {petName}'s week?
        </h1>
        <p className="text-muted-foreground">
          Take 60 seconds to record {petName}'s health this week. We'll compare it to last week and show you any changes.
        </p>
      </div>

      {/* Question 1: New Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Any new symptoms this week?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.newSymptoms ? "yes" : "no"}
            onValueChange={(value) => setFormData({ ...formData, newSymptoms: value === "yes" })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="symptoms-no" />
              <Label htmlFor="symptoms-no" className="cursor-pointer">
                No, nothing new
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="symptoms-yes" />
              <Label htmlFor="symptoms-yes" className="cursor-pointer">
                Yes, noticed new symptoms
              </Label>
            </div>
          </RadioGroup>

          {formData.newSymptoms && (
            <div className="space-y-2">
              <Label htmlFor="symptom-details">What did you notice?</Label>
              <Textarea
                id="symptom-details"
                placeholder="E.g., limping on left leg, coughing at night, not eating breakfast..."
                value={formData.symptomDetails}
                onChange={(e) => setFormData({ ...formData, symptomDetails: e.target.value })}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question 2: Energy Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How was {petName}'s energy level?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.energyLevel}
            onValueChange={(value) =>
              setFormData({ ...formData, energyLevel: value as "better" | "same" | "worse" })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="better" id="energy-better" />
              <Label htmlFor="energy-better" className="cursor-pointer">
                Better than last week
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="same" id="energy-same" />
              <Label htmlFor="energy-same" className="cursor-pointer">
                About the same
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="worse" id="energy-worse" />
              <Label htmlFor="energy-worse" className="cursor-pointer">
                Worse than last week
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Question 3: Appetite */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How was {petName}'s appetite?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.appetite}
            onValueChange={(value) =>
              setFormData({ ...formData, appetite: value as "better" | "same" | "worse" })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="better" id="appetite-better" />
              <Label htmlFor="appetite-better" className="cursor-pointer">
                Better than last week
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="same" id="appetite-same" />
              <Label htmlFor="appetite-same" className="cursor-pointer">
                About the same
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="worse" id="appetite-worse" />
              <Label htmlFor="appetite-worse" className="cursor-pointer">
                Worse than last week
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Question 4: Vet Visit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Any vet visits this week?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.vetVisit ? "yes" : "no"}
            onValueChange={(value) => setFormData({ ...formData, vetVisit: value === "yes" })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="vet-no" />
              <Label htmlFor="vet-no" className="cursor-pointer">
                No vet visits
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="vet-yes" />
              <Label htmlFor="vet-yes" className="cursor-pointer">
                Yes, visited the vet
              </Label>
            </div>
          </RadioGroup>

          {formData.vetVisit && (
            <div className="space-y-2">
              <Label htmlFor="vet-details">What did the vet say?</Label>
              <Textarea
                id="vet-details"
                placeholder="E.g., routine checkup, got blood work done, prescribed new medication..."
                value={formData.vetVisitDetails}
                onChange={(e) => setFormData({ ...formData, vetVisitDetails: e.target.value })}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional: Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anything else worth noting? (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="E.g., started new supplement, changed diet, went on longer walks..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link href="/dashboard">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Complete Check-In"
          )}
        </Button>
      </div>
    </form>
  );
}
