import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toPdfSafeText(value: string) {
  return value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!isSubscriptionActive(user)) {
      return NextResponse.json(
        { message: "Vet reports are a premium feature." },
        { status: 403 }
      );
    }

    const limiter = rateLimit(request, `export-pet-report:${session.user.id}`, {
      limit: 30,
      windowMs: 60 * 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { message: "Too many export requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    if (!petId) {
      return NextResponse.json({ message: "Pet ID required" }, { status: 400 });
    }

    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: session.user.id },
      include: {
        healthLogs: { orderBy: { date: "desc" }, take: 20 },
        recommendations: { orderBy: { createdAt: "desc" }, take: 5 },
        medications: { where: { active: true }, orderBy: { createdAt: "desc" } },
        doseSchedules: { where: { active: true }, orderBy: { createdAt: "desc" } },
        weightLogs: { orderBy: { date: "desc" }, take: 12 },
        photoLogs: { orderBy: { createdAt: "desc" }, take: 4 },
      },
    });

    if (!pet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    const doc = new PDFDocument({ margin: 40 });
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    doc.fontSize(20).text(toPdfSafeText(`FursBliss Vet Report: ${pet.name}`), { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(toPdfSafeText(`Generated: ${new Date().toDateString()}`));
    doc.text(toPdfSafeText(`Breed: ${pet.breed}`));
    doc.text(toPdfSafeText(`Age: ${pet.age}`));
    doc.text(toPdfSafeText(`Weight: ${pet.weight} lbs`));
    doc.text(
      toPdfSafeText(
        `Symptoms: ${
          Array.isArray(pet.symptoms)
            ? pet.symptoms
                .filter((item): item is string => typeof item === "string")
                .join(", ") || "None reported"
            : "None reported"
        }`
      )
    );
    doc.moveDown();
    doc
      .fontSize(10)
      .fillColor("#475569")
      .text(
        toPdfSafeText(
          "Clinical disclaimer: This report summarizes owner-tracked observations and AI-assisted suggestions. It does not replace veterinary diagnosis."
        )
      )
      .fillColor("black");
    doc.moveDown();

  doc.fontSize(14).text("Recent Health Logs");
  doc.moveDown(0.5);
  if (pet.healthLogs.length === 0) {
    doc.fontSize(11).text("No health logs recorded.");
  } else {
    pet.healthLogs.forEach((log) => {
      doc
        .fontSize(11)
        .text(
          toPdfSafeText(
            `${log.date.toDateString()} | Energy: ${log.energyLevel} | Mood: ${
              log.mood ?? "-"
            } | Appetite: ${log.appetite ?? "-"} | Mobility: ${
              log.mobilityLevel ?? "-"
            } | Notes: ${log.notes ?? "-"}`
          )
        );
    });
  }

  doc.moveDown();
  doc.fontSize(14).text("Current Medications");
  doc.moveDown(0.5);
  if (pet.medications.length === 0) {
    doc.fontSize(11).text("No active medications listed.");
  } else {
    pet.medications.forEach((medication) => {
      doc
        .fontSize(11)
        .text(
          toPdfSafeText(
            `${medication.name} | ${medication.dosage} | ${medication.frequency}`
          )
        );
    });
  }

  doc.moveDown();
  doc.fontSize(14).text("Supplement Schedule");
  doc.moveDown(0.5);
  if (pet.doseSchedules.length === 0) {
    doc.fontSize(11).text("No active supplement schedules listed.");
  } else {
    pet.doseSchedules.forEach((dose) => {
      doc
        .fontSize(11)
        .text(
          toPdfSafeText(
            `${dose.supplementName} | ${dose.dosage} | ${dose.frequency}${
              dose.notes ? ` | Notes: ${dose.notes}` : ""
            }`
          )
        );
    });
  }

  doc.moveDown();
  doc.fontSize(14).text("Weight Trend");
  doc.moveDown(0.5);
  if (pet.weightLogs.length === 0) {
    doc.fontSize(11).text("No weight entries recorded.");
  } else {
    pet.weightLogs.forEach((weightEntry) => {
      doc
        .fontSize(11)
        .text(toPdfSafeText(`${weightEntry.date.toDateString()} | ${weightEntry.weight} lbs`));
    });
  }

  doc.moveDown();
  doc.fontSize(14).text("Recent AI Recommendations");
  doc.moveDown(0.5);
  if (pet.recommendations.length === 0) {
    doc.fontSize(11).text("No AI recommendations recorded.");
  } else {
    pet.recommendations.forEach((rec) => {
      doc
        .fontSize(11)
        .text(toPdfSafeText(`${rec.createdAt.toDateString()} - ${rec.response}`));
      doc.moveDown(0.2);
    });
  }

  doc.moveDown();
  doc.fontSize(14).text("Recent Photo Evidence");
  doc.moveDown(0.5);
  if (pet.photoLogs.length === 0) {
    doc.fontSize(11).text("No photos uploaded.");
  } else {
    pet.photoLogs.forEach((photo) => {
      doc
        .fontSize(11)
        .text(
          toPdfSafeText(
            `${photo.createdAt.toDateString()} | ${photo.category ?? "general"} | ${
              photo.caption ?? "-"
            }`
          )
        );
      if (photo.aiAnalysis) {
        doc.fontSize(10).text(toPdfSafeText(`AI note: ${photo.aiAnalysis}`));
      }
      doc.moveDown(0.2);
    });
  }

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    const pdfBytes = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${encodeURIComponent(
          toPdfSafeText(pet.name || "pet")
        )}-report.pdf`,
      },
    });
  } catch (error) {
    console.error("Pet report export failed", error);
    return NextResponse.json(
      { message: "Unable to generate pet report right now." },
      { status: 500 }
    );
  }
}
