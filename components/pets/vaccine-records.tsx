"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type VaccineRecord = {
  id: string;
  vaccineName: string;
  administeredOn: string;
  nextDueOn?: string | null;
  clinic?: string | null;
  notes?: string;
  recordUrl?: string;
};

type VaccineRecordsProps = {
  petId: string;
  initialRecords: VaccineRecord[];
};

function toIsoDate(value: string) {
  if (!value) return undefined;
  return new Date(`${value}T12:00:00.000Z`).toISOString();
}

export function VaccineRecords({ petId, initialRecords }: VaccineRecordsProps) {
  const [records, setRecords] = useState(initialRecords);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    vaccineName: "",
    administeredOn: "",
    nextDueOn: "",
    clinic: "",
    notes: "",
    recordUrl: "",
  });

  const submit = async () => {
    setError(null);
    if (!form.vaccineName.trim() || !form.administeredOn) {
      setError("Vaccine name and administered date are required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/pets/${petId}/vaccines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaccineName: form.vaccineName.trim(),
          administeredOn: toIsoDate(form.administeredOn),
          nextDueOn: toIsoDate(form.nextDueOn),
          clinic: form.clinic.trim() || undefined,
          notes: form.notes.trim() || undefined,
          recordUrl: form.recordUrl.trim() || undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to save vaccine record.");
      }

      const refresh = await fetch(`/api/pets/${petId}/vaccines`);
      const nextRecords = (await refresh.json()) as VaccineRecord[];
      setRecords(nextRecords);
      setForm({
        vaccineName: "",
        administeredOn: "",
        nextDueOn: "",
        clinic: "",
        notes: "",
        recordUrl: "",
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save vaccine record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add vaccine record</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input
            placeholder="Vaccine name (e.g. Rabies)"
            value={form.vaccineName}
            onChange={(event) => setForm((prev) => ({ ...prev, vaccineName: event.target.value }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              type="date"
              value={form.administeredOn}
              onChange={(event) => setForm((prev) => ({ ...prev, administeredOn: event.target.value }))}
            />
            <Input
              type="date"
              value={form.nextDueOn}
              onChange={(event) => setForm((prev) => ({ ...prev, nextDueOn: event.target.value }))}
            />
          </div>
          <Input
            placeholder="Clinic or veterinarian (optional)"
            value={form.clinic}
            onChange={(event) => setForm((prev) => ({ ...prev, clinic: event.target.value }))}
          />
          <Input
            placeholder="Record URL (optional)"
            value={form.recordUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, recordUrl: event.target.value }))}
          />
          <Input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Save vaccine record"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vaccine history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vaccine records yet.</p>
          ) : (
            records.map((record) => (
              <div key={record.id} className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="font-medium text-foreground">{record.vaccineName}</p>
                <p className="text-sm text-muted-foreground">
                  Given: {new Date(record.administeredOn).toLocaleDateString()}
                  {record.nextDueOn ? ` • Next due: ${new Date(record.nextDueOn).toLocaleDateString()}` : ""}
                </p>
                {record.clinic ? (
                  <p className="text-sm text-muted-foreground">Clinic: {record.clinic}</p>
                ) : null}
                {record.notes ? (
                  <p className="mt-1 text-sm text-muted-foreground">{record.notes}</p>
                ) : null}
                {record.recordUrl ? (
                  <a
                    href={record.recordUrl}
                    className="mt-1 inline-block text-sm text-primary underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open uploaded record
                  </a>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
