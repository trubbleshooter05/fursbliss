import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  vaccineName: z.string().trim().min(1),
  administeredOn: z.string().datetime(),
  nextDueOn: z.string().datetime().optional(),
  clinic: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  recordUrl: z.string().url().optional(),
});

type RouteParams = { params: { id: string } };

type VaccineMeta = {
  notes?: string;
  recordUrl?: string;
};

function parseVaccineMeta(raw: string | null) {
  if (!raw) return {} as VaccineMeta;
  try {
    return JSON.parse(raw) as VaccineMeta;
  } catch {
    return { notes: raw };
  }
}

export async function GET(_: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const records = await prisma.medication.findMany({
    where: { petId: pet.id, reason: "vaccine_record" },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(
    records.map((record) => {
      const meta = parseVaccineMeta(record.notes ?? null);
      return {
        id: record.id,
        vaccineName: record.name,
        administeredOn: record.startDate,
        nextDueOn: record.endDate,
        clinic: record.prescribedBy,
        notes: meta.notes ?? "",
        recordUrl: meta.recordUrl ?? "",
      };
    })
  );
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid vaccine record data." }, { status: 400 });
  }

  const notesPayload = JSON.stringify({
    notes: parsed.data.notes ?? "",
    recordUrl: parsed.data.recordUrl ?? "",
  });

  const record = await prisma.medication.create({
    data: {
      petId: pet.id,
      name: parsed.data.vaccineName,
      dosage: "recorded dose",
      frequency: "as scheduled",
      startDate: new Date(parsed.data.administeredOn),
      endDate: parsed.data.nextDueOn ? new Date(parsed.data.nextDueOn) : null,
      prescribedBy: parsed.data.clinic ?? null,
      reason: "vaccine_record",
      notes: notesPayload,
      active: false,
    },
  });

  return NextResponse.json({ ok: true, id: record.id });
}
