import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";

function normalizeRangeDays(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 30;
  }
  return Math.min(365, Math.max(7, Math.round(parsed)));
}

function toDateWindow(rangeDays: number) {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - rangeDays);
  return from;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const petId = searchParams.get("petId");
  const token = searchParams.get("token");
  const rangeDays = normalizeRangeDays(searchParams.get("range"));
  const fromDate = toDateWindow(rangeDays);

  if (!petId) {
    return NextResponse.json({ message: "petId is required" }, { status: 400 });
  }

  let pet: any = null;

  if (token) {
    const link = await prisma.vetShareLink.findUnique({
      where: { token },
      include: {
        pet: {
          include: {
            healthLogs: {
              where: { date: { gte: fromDate } },
              orderBy: { date: "desc" },
              take: 120,
            },
            recommendations: { orderBy: { createdAt: "desc" }, take: 5 },
            medications: { where: { active: true }, orderBy: { createdAt: "desc" } },
            doseSchedules: { where: { active: true }, orderBy: { createdAt: "desc" } },
            weightLogs: {
              where: { date: { gte: fromDate } },
              orderBy: { date: "desc" },
              take: 60,
            },
            photoLogs: { orderBy: { createdAt: "desc" }, take: 8 },
          },
        },
      },
    });

    if (!link || link.expiresAt < new Date() || link.petId !== petId) {
      return NextResponse.json({ message: "Share link is invalid or expired" }, { status: 404 });
    }

    pet = link.pet;
  } else {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
    });

    if (!user || !isSubscriptionActive(user)) {
      return NextResponse.json({ message: "Vet reports are a premium feature." }, { status: 403 });
    }

    pet = await prisma.pet.findFirst({
      where: { id: petId, userId: session.user.id },
      include: {
        healthLogs: {
          where: { date: { gte: fromDate } },
          orderBy: { date: "desc" },
          take: 120,
        },
        recommendations: { orderBy: { createdAt: "desc" }, take: 5 },
        medications: { where: { active: true }, orderBy: { createdAt: "desc" } },
        doseSchedules: { where: { active: true }, orderBy: { createdAt: "desc" } },
        weightLogs: {
          where: { date: { gte: fromDate } },
          orderBy: { date: "desc" },
          take: 60,
        },
        photoLogs: { orderBy: { createdAt: "desc" }, take: 8 },
      },
    });
  }

  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const doc = new PDFDocument({ margin: 40 });
  const chunks: Uint8Array[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fillColor("#0D6E6E").fontSize(20).text(`FursBliss Vet Report: ${pet.name}`, {
    underline: true,
  });
  doc.fillColor("black");
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toDateString()}`);
  doc.text(`Date range: last ${rangeDays} days`);
  doc.text(`Breed: ${pet.breed}`);
  doc.text(`Age: ${pet.age}`);
  doc.text(`Weight: ${pet.weight} lbs`);
  doc.moveDown();
  doc
    .fontSize(10)
    .fillColor("#64748B")
    .text(
      "Clinical disclaimer: This report summarizes owner-tracked observations and AI-assisted suggestions. It does not replace veterinary diagnosis."
    )
    .fillColor("black");
  doc.moveDown();

  const sectionTitle = (title: string) => {
    doc.fillColor("#0D6E6E").fontSize(14).text(title);
    doc.fillColor("black").moveDown(0.5);
  };

  sectionTitle("Health trend summary");
  if (pet.healthLogs.length === 0) {
    doc.fontSize(11).text("No health logs in this date range.");
  } else {
    pet.healthLogs.forEach((log: any) => {
      doc
        .fontSize(11)
        .text(
          `${log.date.toDateString()} | Energy: ${log.energyLevel} | Mood: ${
            log.mood ?? "-"
          } | Appetite: ${log.appetite ?? "-"} | Mobility: ${log.mobilityLevel ?? "-"}`
        );
    });
  }

  doc.moveDown();
  sectionTitle("Supplement adherence");
  if (pet.doseSchedules.length === 0) {
    doc.fontSize(11).text("No active supplement schedules listed.");
  } else {
    pet.doseSchedules.forEach((dose: any) => {
      doc.fontSize(11).text(`${dose.supplementName} | ${dose.dosage} | ${dose.frequency}`);
    });
  }

  doc.moveDown();
  sectionTitle("AI insights");
  if (pet.recommendations.length === 0) {
    doc.fontSize(11).text("No AI recommendations recorded.");
  } else {
    pet.recommendations.forEach((rec: any) => {
      doc.fontSize(11).text(`${rec.createdAt.toDateString()} - ${rec.response}`);
      doc.moveDown(0.2);
    });
  }

  doc.moveDown();
  sectionTitle("Weight chart data");
  if (pet.weightLogs.length === 0) {
    doc.fontSize(11).text("No weight entries in this date range.");
  } else {
    pet.weightLogs.forEach((entry: any) => {
      doc.fontSize(11).text(`${entry.date.toDateString()} | ${entry.weight} lbs`);
    });
  }

  doc.moveDown();
  doc
    .fontSize(10)
    .fillColor("#64748B")
    .text("Generated by FursBliss — www.fursbliss.com")
    .fillColor("black");

  doc.end();

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${pet.name}-vet-report.pdf`,
    },
  });
}
