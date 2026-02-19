import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { LongevityReadinessReportPayload } from "@/lib/longevity/report";

const BRAND = {
  teal: rgb(13 / 255, 110 / 255, 110 / 255),
  mint: rgb(230 / 255, 246 / 255, 243 / 255),
  text: rgb(17 / 255, 24 / 255, 39 / 255),
  muted: rgb(107 / 255, 114 / 255, 128 / 255),
  accent: rgb(232 / 255, 168 / 255, 56 / 255),
  white: rgb(1, 1, 1),
  border: rgb(229 / 255, 231 / 255, 235 / 255),
  slate100: rgb(248 / 255, 250 / 255, 252 / 255),
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

function drawTextBlock(params: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  lineHeight: number;
  size: number;
  font: PDFFont;
  color: ReturnType<typeof rgb>;
}) {
  const { page, text, x, y, maxWidth, lineHeight, size, font, color } = params;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, size);
    if (width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  let cursorY = y;
  for (const line of lines) {
    page.drawText(line, { x, y: cursorY, size, font, color });
    cursorY -= lineHeight;
  }
  return cursorY;
}

export async function renderLongevityReadinessPdf(
  payload: LongevityReadinessReportPayload
) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`${safePdfText(payload.dog.name)} - Longevity Readiness Report`);
  pdfDoc.setAuthor("FursBliss");
  pdfDoc.setSubject("Dog Longevity Readiness Report");

  const page = pdfDoc.addPage([612, 792]); // US Letter
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const left = 42;
  const pageWidth = 612 - 84;
  let y = 750;

  // Header
  page.drawRectangle({
    x: left,
    y: y - 64,
    width: pageWidth,
    height: 64,
    color: BRAND.teal,
  });
  page.drawText("FursBliss", { x: left + 16, y: y - 28, font: bold, size: 22, color: BRAND.white });
  page.drawText("Longevity Readiness Report", {
    x: left + 16,
    y: y - 45,
    font: regular,
    size: 11,
    color: BRAND.white,
  });
  page.drawText(`Generated ${formatDate(payload.generatedAtIso)}`, {
    x: left + pageWidth - 140,
    y: y - 30,
    font: regular,
    size: 10,
    color: BRAND.white,
  });

  y -= 84;

  // Dog profile strip
  page.drawRectangle({
    x: left,
    y: y - 52,
    width: pageWidth,
    height: 52,
    color: BRAND.mint,
  });
  page.drawText(safePdfText(payload.dog.name), {
    x: left + 14,
    y: y - 22,
    font: bold,
    size: 12,
    color: BRAND.text,
  });
  page.drawText(
    `${safePdfText(payload.dog.breed)} | ${payload.dog.age} years | ${payload.dog.weight} lbs`,
    { x: left + 14, y: y - 38, font: regular, size: 10, color: BRAND.text }
  );

  y -= 72;

  page.drawText("Longevity Readiness Score", {
    x: left,
    y,
    font: bold,
    size: 13,
    color: BRAND.text,
  });
  page.drawRectangle({
    x: left,
    y: y - 54,
    width: 110,
    height: 42,
    color: BRAND.slate100,
    borderColor: BRAND.border,
    borderWidth: 1,
  });
  page.drawText(String(payload.longevityScore.value), {
    x: left + 16,
    y: y - 38,
    font: bold,
    size: 26,
    color: BRAND.teal,
  });
  page.drawText("/100", {
    x: left + 70,
    y: y - 31,
    font: regular,
    size: 10,
    color: BRAND.muted,
  });
  drawTextBlock({
    page,
    text: safePdfText(payload.longevityScore.interpretation),
    x: left + 126,
    y: y - 18,
    maxWidth: pageWidth - 126,
    lineHeight: 13,
    size: 10.5,
    font: regular,
    color: BRAND.text,
  });

  y -= 80;

  const colGap = 14;
  const colWidth = (pageWidth - colGap) / 2;

  page.drawRectangle({
    x: left,
    y: y - 88,
    width: colWidth,
    height: 88,
    borderColor: BRAND.border,
    borderWidth: 1,
  });
  page.drawText("LOY-002 Eligibility Status", {
    x: left + 10,
    y: y - 18,
    font: bold,
    size: 11.5,
    color: BRAND.text,
  });
  page.drawText(safePdfText(payload.loy002Eligibility.statusLabel), {
    x: left + 10,
    y: y - 36,
    font: bold,
    size: 12,
    color: payload.loy002Eligibility.isEligible
      ? rgb(4 / 255, 120 / 255, 87 / 255)
      : rgb(180 / 255, 83 / 255, 9 / 255),
  });
  drawTextBlock({
    page,
    text: safePdfText(payload.loy002Eligibility.detail),
    x: left + 10,
    y: y - 52,
    maxWidth: colWidth - 20,
    lineHeight: 12,
    size: 9.5,
    font: regular,
    color: BRAND.muted,
  });

  const rightColX = left + colWidth + colGap;
  page.drawRectangle({
    x: rightColX,
    y: y - 88,
    width: colWidth,
    height: 88,
    borderColor: BRAND.border,
    borderWidth: 1,
  });
  page.drawText("Breed Lifespan Reference", {
    x: rightColX + 10,
    y: y - 18,
    font: bold,
    size: 11.5,
    color: BRAND.text,
  });
  page.drawText(`${payload.breedLifespan.averageYears.toFixed(1)} years avg`, {
    x: rightColX + 10,
    y: y - 38,
    font: bold,
    size: 16,
    color: BRAND.text,
  });
  drawTextBlock({
    page,
    text: safePdfText(payload.breedLifespan.referenceLabel),
    x: rightColX + 10,
    y: y - 56,
    maxWidth: colWidth - 20,
    lineHeight: 12,
    size: 9.5,
    font: regular,
    color: BRAND.muted,
  });

  y -= 106;
  page.drawText("Top 3 Personalized Next Steps", {
    x: left,
    y,
    font: bold,
    size: 13,
    color: BRAND.text,
  });
  y -= 20;
  payload.nextSteps.slice(0, 3).forEach((step, index) => {
    page.drawCircle({ x: left + 7, y: y + 3, size: 7, color: BRAND.accent });
    page.drawText(String(index + 1), {
      x: left + 4.3,
      y: y + 0.4,
      font: bold,
      size: 8.8,
      color: BRAND.text,
    });
    y =
      drawTextBlock({
        page,
        text: safePdfText(step),
        x: left + 20,
        y: y - 1,
        maxWidth: pageWidth - 24,
        lineHeight: 13,
        size: 10.3,
        font: regular,
        color: BRAND.text,
      }) - 8;
  });

  const footerY = 54;
  page.drawLine({
    start: { x: left, y: footerY + 18 },
    end: { x: left + pageWidth, y: footerY + 18 },
    thickness: 1,
    color: BRAND.border,
  });
  page.drawText("Generated by FursBliss", {
    x: left,
    y: footerY,
    font: bold,
    size: 9.5,
    color: BRAND.muted,
  });
  drawTextBlock({
    page,
    text: safePdfText(payload.disclaimer),
    x: left + 120,
    y: footerY,
    maxWidth: pageWidth - 120,
    lineHeight: 10.5,
    size: 8.4,
    font: regular,
    color: BRAND.muted,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
