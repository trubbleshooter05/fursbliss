import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const checkInSchema = z.object({
  petId: z.string(),
  weekStartDate: z.string(), // ISO date string
  newSymptoms: z.boolean(),
  symptomDetails: z.string().optional(),
  energyLevel: z.enum(["better", "same", "worse"]),
  appetite: z.enum(["better", "same", "worse"]),
  vetVisit: z.boolean(),
  vetVisitDetails: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid check-in data", errors: parsed.error.issues },
        { status: 400 }
      );
    }

    const { petId, weekStartDate, ...checkInData } = parsed.data;

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId: session.user.id,
      },
    });

    if (!pet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    // Check if check-in already exists for this week
    const existingCheckIn = await prisma.weeklyCheckIn.findFirst({
      where: {
        petId,
        userId: session.user.id,
        weekStartDate: new Date(weekStartDate),
      },
    });

    let checkIn;
    if (existingCheckIn) {
      // Update existing check-in
      checkIn = await prisma.weeklyCheckIn.update({
        where: { id: existingCheckIn.id },
        data: {
          ...checkInData,
          symptomDetails: checkInData.symptomDetails || null,
          vetVisitDetails: checkInData.vetVisitDetails || null,
          notes: checkInData.notes || null,
        },
      });
    } else {
      // Create new check-in
      checkIn = await prisma.weeklyCheckIn.create({
        data: {
          userId: session.user.id,
          petId,
          weekStartDate: new Date(weekStartDate),
          ...checkInData,
          symptomDetails: checkInData.symptomDetails || null,
          vetVisitDetails: checkInData.vetVisitDetails || null,
          notes: checkInData.notes || null,
        },
      });
    }

    return NextResponse.json({ success: true, checkIn });
  } catch (error) {
    console.error("Weekly check-in error:", error);
    return NextResponse.json(
      { message: "Unable to save check-in" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    if (!petId) {
      return NextResponse.json({ message: "Pet ID required" }, { status: 400 });
    }

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId: session.user.id,
      },
    });

    if (!pet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    // Get all check-ins for this pet (last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - (12 * 7));

    const checkIns = await prisma.weeklyCheckIn.findMany({
      where: {
        petId,
        userId: session.user.id,
        weekStartDate: {
          gte: twelveWeeksAgo,
        },
      },
      orderBy: {
        weekStartDate: "desc",
      },
    });

    return NextResponse.json({ checkIns });
  } catch (error) {
    console.error("Fetch check-ins error:", error);
    return NextResponse.json(
      { message: "Unable to fetch check-ins" },
      { status: 500 }
    );
  }
}
