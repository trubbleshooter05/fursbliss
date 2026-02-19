import PDFDocument from "pdfkit";
import type { LongevityReadinessReportPayload } from "@/lib/longevity/report";

const BRAND = {
  teal: "#0D6E6E",
  mint: "#E6F6F3",
  text: "#111827",
  muted: "#6B7280",
  accent: "#E8A838",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function safePdfText(value: string) {
  // PDFKit built-in fonts are WinAnsi; normalize dynamic text to avoid
  // unsupported Unicode glyph crashes in production.
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function renderLongevityReadinessPdf(
  payload: LongevityReadinessReportPayload
) {
  const doc = new PDFDocument({
    size: "LETTER",
    margin: 42,
    info: {
      Title: `${safePdfText(payload.dog.name)} - Longevity Readiness Report`,
      Author: "FursBliss",
      Subject: "Dog Longevity Readiness Report",
    },
  });

  const chunks: Uint8Array[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  // Header
  doc
    .save()
    .roundedRect(left, 32, pageWidth, 82, 14)
    .fill(BRAND.teal)
    .restore();

  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(21).text("FursBliss", left + 18, 50);
  doc
    .font("Helvetica")
    .fontSize(11)
    .text("Longevity Readiness Report", left + 18, 77);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#D1FAF5")
    .text(`Generated ${formatDate(payload.generatedAtIso)}`, left + pageWidth - 140, 53, {
      align: "right",
      width: 120,
    });

  let y = 128;

  // Dog profile strip
  doc
    .save()
    .roundedRect(left, y, pageWidth, 58, 12)
    .fill(BRAND.mint)
    .restore();
  doc
    .fillColor(BRAND.text)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(safePdfText(payload.dog.name), left + 16, y + 14);
  doc
    .font("Helvetica")
    .fontSize(10.5)
    .text(
      `${safePdfText(payload.dog.breed)} | ${payload.dog.age} years | ${payload.dog.weight} lbs`,
      left + 16,
      y + 33
    );

  y += 76;

  // Score block
  doc.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(13).text("Longevity Readiness Score", left, y);
  doc
    .save()
    .roundedRect(left, y + 20, 110, 54, 10)
    .fill("#F8FAFC")
    .restore();
  doc.fillColor(BRAND.teal).font("Helvetica-Bold").fontSize(27).text(String(payload.longevityScore.value), left + 18, y + 34);
  doc.fillColor(BRAND.muted).font("Helvetica").fontSize(10).text("/ 100", left + 70, y + 46);
  doc
    .fillColor(BRAND.text)
    .font("Helvetica")
    .fontSize(10.5)
    .text(safePdfText(payload.longevityScore.interpretation), left + 130, y + 30, {
      width: pageWidth - 140,
    });

  y += 90;

  // Eligibility and lifespan two-column
  const colGap = 14;
  const colWidth = (pageWidth - colGap) / 2;

  doc
    .save()
    .roundedRect(left, y, colWidth, 94, 10)
    .strokeColor("#D1D5DB")
    .lineWidth(1)
    .stroke()
    .restore();
  doc.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(11.5).text("LOY-002 Eligibility Status", left + 12, y + 12);
  doc
    .fillColor(payload.loy002Eligibility.isEligible ? "#047857" : "#B45309")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(safePdfText(payload.loy002Eligibility.statusLabel), left + 12, y + 34);
  doc
    .fillColor(BRAND.muted)
    .font("Helvetica")
    .fontSize(9.8)
    .text(safePdfText(payload.loy002Eligibility.detail), left + 12, y + 54, {
      width: colWidth - 24,
    });

  const rightColX = left + colWidth + colGap;
  doc
    .save()
    .roundedRect(rightColX, y, colWidth, 94, 10)
    .strokeColor("#D1D5DB")
    .lineWidth(1)
    .stroke()
    .restore();
  doc
    .fillColor(BRAND.text)
    .font("Helvetica-Bold")
    .fontSize(11.5)
    .text("Breed Lifespan Reference", rightColX + 12, y + 12);
  doc
    .fillColor(BRAND.text)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(`${payload.breedLifespan.averageYears.toFixed(1)} years avg`, rightColX + 12, y + 35);
  doc
    .fillColor(BRAND.muted)
    .font("Helvetica")
    .fontSize(9.8)
    .text(safePdfText(payload.breedLifespan.referenceLabel), rightColX + 12, y + 59, {
      width: colWidth - 24,
    });

  y += 114;

  // Next steps
  doc.fillColor(BRAND.text).font("Helvetica-Bold").fontSize(13).text("Top 3 Personalized Next Steps", left, y);
  y += 22;
  payload.nextSteps.forEach((step, index) => {
    doc
      .save()
      .circle(left + 8, y + 7, 7)
      .fill(BRAND.accent)
      .restore();
    doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(9).text(String(index + 1), left + 5.6, y + 4.2);
    doc
      .fillColor(BRAND.text)
      .font("Helvetica")
      .fontSize(10.4)
      .text(safePdfText(step), left + 22, y, { width: pageWidth - 24 });
    y += 34;
  });

  // Footer
  const footerY = doc.page.height - 72;
  doc
    .moveTo(left, footerY - 8)
    .lineTo(left + pageWidth, footerY - 8)
    .strokeColor("#E5E7EB")
    .lineWidth(1)
    .stroke();
  doc.fillColor(BRAND.muted).font("Helvetica-Bold").fontSize(9.6).text("Generated by FursBliss", left, footerY);
  doc
    .font("Helvetica")
    .fontSize(8.6)
    .text(safePdfText(payload.disclaimer), left + 120, footerY, {
      width: pageWidth - 120,
    });

  doc.end();

  return await new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
