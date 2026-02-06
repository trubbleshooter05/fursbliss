import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    },
  });

  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const doc = new PDFDocument({ margin: 40 });
  const chunks: Uint8Array[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(20).text(`FursBliss Report: ${pet.name}`, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Breed: ${pet.breed}`);
  doc.text(`Age: ${pet.age}`);
  doc.text(`Weight: ${pet.weight} lbs`);
  doc.text(`Symptoms: ${(pet.symptoms as string[]).join(", ")}`);
  doc.moveDown();

  doc.fontSize(14).text("Recent Health Logs");
  doc.moveDown(0.5);
  pet.healthLogs.forEach((log) => {
    doc
      .fontSize(11)
      .text(
        `${log.date.toDateString()} | Energy: ${log.energyLevel} | Mood: ${
          log.mood ?? "-"
        } | Appetite: ${log.appetite ?? "-"} | Notes: ${log.notes ?? "-"}`
      );
  });

  doc.moveDown();
  doc.fontSize(14).text("Recent AI Recommendations");
  doc.moveDown(0.5);
  pet.recommendations.forEach((rec) => {
    doc.fontSize(11).text(`${rec.createdAt.toDateString()} - ${rec.response}`);
  });

  doc.end();

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${pet.name}-report.pdf`,
    },
  });
}
