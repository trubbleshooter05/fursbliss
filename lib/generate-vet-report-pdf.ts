import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import type { VetReadyReport } from "@/app/api/pets/[id]/vet-report/route";

// Sanitize to ASCII-safe text
function s(value: string): string {
  return value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

const MARGIN = 45;
const PAGE_W = 612;
const PAGE_H = 792;
const CONTENT_W = PAGE_W - MARGIN * 2;

// pdf-lib uses 0–1 RGB
const C = {
  black:     rgb(0.07, 0.07, 0.07),
  gray:      rgb(0.42, 0.45, 0.50),
  lightGray: rgb(0.82, 0.84, 0.86),
  bgGray:    rgb(0.98, 0.98, 0.99),
  red:       rgb(0.86, 0.15, 0.15),
  yellow:    rgb(0.85, 0.47, 0.02),
  green:     rgb(0.09, 0.64, 0.29),
  accent:    rgb(0.12, 0.25, 0.69),
  white:     rgb(1, 1, 1),
};

function trendArrow(trend: "improving" | "declining" | "stable"): string {
  if (trend === "improving") return "(+)";
  if (trend === "declining") return "(-)";
  return "(=)";
}

function severityColor(severity: "high" | "medium" | "low") {
  if (severity === "high") return C.red;
  if (severity === "medium") return C.yellow;
  return C.gray;
}

// Draw text that wraps at maxWidth, returns new y position
function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let curY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && line) {
      if (curY < 30) break; // stop if too close to bottom
      page.drawText(s(line), { x, y: curY, size, font, color });
      curY -= lineHeight;
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line && curY >= 30) {
    page.drawText(s(line), { x, y: curY, size, font, color });
    curY -= lineHeight;
  }
  return curY;
}

export async function generateVetReportPDF(report: VetReadyReport): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // pdf-lib y=0 is bottom; we work top-down by tracking y from top
  // helper: convert from "top-down y" to pdf-lib y
  const py = (y: number) => PAGE_H - y;

  // ── HEADER BAR ───────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: py(62), width: PAGE_W, height: 62, color: C.accent });

  page.drawText(s("FursBliss Vet-Ready Health Summary"), {
    x: MARGIN, y: py(26), font: bold, size: 14, color: C.white,
  });
  page.drawText(
    s(`${report.pet.name}  |  ${report.period.start} – ${report.period.end}  |  Generated: ${new Date(report.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`),
    { x: MARGIN, y: py(50), font: regular, size: 8, color: C.white }
  );

  let y = 76;

  // ── HELPER: section heading ───────────────────────────────────────────────
  function sectionHeading(label: string) {
    page.drawText(s(label), { x: MARGIN, y: py(y), font: bold, size: 9, color: C.black });
    y += 11;
    page.drawLine({
      start: { x: MARGIN, y: py(y) },
      end: { x: MARGIN + CONTENT_W, y: py(y) },
      thickness: 0.5,
      color: C.lightGray,
    });
    y += 6;
  }

  // ── SECTION 1: PET INFO ──────────────────────────────────────────────────
  sectionHeading("PATIENT INFORMATION");

  const petInfoLine = s(
    `${report.pet.name}  •  ${report.pet.breed}  •  ${report.pet.age}  •  Weight: ${report.pet.weight.current} lbs ${report.pet.weight.trend === "gaining" ? "(gaining)" : report.pet.weight.trend === "losing" ? "(losing)" : "(stable)"}`
  );
  const logLine = s(
    `Logging period: ${report.period.start} – ${report.period.end}  •  ${report.period.totalDaysLogged}/${report.period.totalDaysLogged > 0 ? Math.round(30) : 30} days logged  •  Completion: ${Math.round(report.period.logCompletionRate * 100)}%`
  );
  page.drawText(petInfoLine, { x: MARGIN, y: py(y), font: regular, size: 8.5, color: C.black });
  y += 13;
  page.drawText(logLine, { x: MARGIN, y: py(y), font: regular, size: 8, color: C.gray });
  y += 18;

  // ── SECTION 2: 30-DAY TRENDS ─────────────────────────────────────────────
  sectionHeading("30-DAY HEALTH TRENDS");

  const metrics = ["Energy", "Appetite", "Mobility", "Mood"] as const;
  const metricKeys = ["energy", "appetite", "mobility", "mood"] as const;
  const colW = CONTENT_W / 4;

  // Column headers
  metrics.forEach((m, i) => {
    page.drawText(s(m), { x: MARGIN + i * colW + 2, y: py(y), font: bold, size: 8, color: C.gray });
  });
  y += 12;

  // Averages row
  metricKeys.forEach((k, i) => {
    const t = report.trends[k];
    const avg = typeof t.average === "number" ? t.average.toFixed(1) : "—";
    const arrow = trendArrow(t.trend);
    page.drawText(s(`${avg} ${arrow}`), { x: MARGIN + i * colW + 2, y: py(y), font: regular, size: 9, color: C.black });
  });
  y += 11;

  // Week-over-week row label + data
  page.drawText("Week avg:", { x: MARGIN, y: py(y), font: regular, size: 7.5, color: C.gray });
  metricKeys.forEach((k, i) => {
    const ww = report.trends[k].weekOverWeek;
    const weekStr = ww.map((v) => (v > 0 ? v.toFixed(1) : "—")).join(" / ");
    page.drawText(s(weekStr), { x: MARGIN + i * colW + 2, y: py(y), font: regular, size: 7, color: C.gray });
  });
  y += 11;

  // Stool
  page.drawText(
    s(`Stool: ${report.trends.stool.normalDays} normal days, ${report.trends.stool.abnormalDays} abnormal days${report.trends.stool.abnormalDetails.length ? " — " + report.trends.stool.abnormalDetails.slice(0, 3).join(", ") : ""}`),
    { x: MARGIN, y: py(y), font: regular, size: 7.5, color: C.gray }
  );
  y += 18;

  // ── SECTION 3: FLAGGED CONCERNS ──────────────────────────────────────────
  sectionHeading("FLAGGED CONCERNS");

  if (report.concerns.length === 0) {
    page.drawText("No concerns flagged for this period.", { x: MARGIN, y: py(y), font: regular, size: 8.5, color: C.green });
    y += 18;
  } else {
    for (const concern of report.concerns.slice(0, 5)) {
      if (y > PAGE_H - 140) break;
      const dot = concern.severity === "high" ? "[!]" : concern.severity === "medium" ? "[~]" : "[ ]";
      const color = severityColor(concern.severity);
      page.drawText(s(`${dot} ${concern.category}`), { x: MARGIN, y: py(y), font: bold, size: 8.5, color });
      y += 11;
      y = drawWrappedText(page, concern.description, MARGIN + 12, py(y), regular, 7.5, C.black, CONTENT_W - 12, 10);
      // drawWrappedText returns pdf-lib y (bottom-up), convert back
      // Actually we're tracking y top-down, so adjust:
      y += 8;
    }
    y += 4;
  }

  // ── SECTION 4: DISCUSSION TOPICS ─────────────────────────────────────────
  if (y < PAGE_H - 120) {
    sectionHeading("RECOMMENDED DISCUSSION TOPICS FOR VET VISIT");
    const topics = report.discussionTopics.slice(0, 5);
    if (topics.length === 0) {
      page.drawText("No specific topics flagged.", { x: MARGIN, y: py(y), font: regular, size: 8.5, color: C.gray });
      y += 16;
    } else {
      topics.forEach((topic, i) => {
        if (y > PAGE_H - 100) return;
        const line = s(`${i + 1}. ${topic}`);
        page.drawText(line.substring(0, 90), { x: MARGIN, y: py(y), font: regular, size: 8.5, color: C.black });
        y += 12;
        if (line.length > 90) {
          page.drawText(line.substring(90, 170), { x: MARGIN + 12, y: py(y), font: regular, size: 8.5, color: C.black });
          y += 12;
        }
      });
    }
    y += 6;
  }

  // ── SECTION 5: WEEKLY CHECK-INS ──────────────────────────────────────────
  if (y < PAGE_H - 80) {
    sectionHeading("WEEKLY CHECK-IN SUMMARY");
    const wc = report.weeklyCheckIns;
    page.drawText(
      s(`${wc.completed} of ${wc.totalPossible} check-ins completed  •  New symptoms reported: ${wc.newSymptomsReported ? "Yes" : "No"}  •  Vet visits: ${wc.vetVisitsReported}`),
      { x: MARGIN, y: py(y), font: regular, size: 8.5, color: C.black }
    );
    y += 14;
    if (wc.symptomDetails.length > 0) {
      page.drawText(s(`Symptoms noted: ${wc.symptomDetails.slice(0, 4).join("; ")}`), {
        x: MARGIN, y: py(y), font: regular, size: 7.5, color: C.gray
      });
      y += 12;
    }
    y += 6;
  }

  // ── SECTION 6: SUPPLEMENTS / MEDICATIONS ────────────────────────────────
  if (y < PAGE_H - 60 && report.supplements.length > 0) {
    sectionHeading("CURRENT SUPPLEMENTS / MEDICATIONS");
    report.supplements.slice(0, 6).forEach((sup) => {
      if (y > PAGE_H - 50) return;
      page.drawText(s(`• ${sup.name}${sup.dosage ? "  " + sup.dosage : ""}  (since ${sup.startDate})`), {
        x: MARGIN, y: py(y), font: regular, size: 8, color: C.black,
      });
      y += 11;
    });
    y += 6;
  }

  // ── FOOTER ───────────────────────────────────────────────────────────────
  const footerY = 28;
  page.drawLine({
    start: { x: MARGIN, y: footerY + 10 },
    end: { x: MARGIN + CONTENT_W, y: footerY + 10 },
    thickness: 0.5,
    color: C.lightGray,
  });
  page.drawText(
    "Generated by FursBliss — www.fursbliss.com  |  This is not veterinary advice. Discuss all findings with your veterinarian.",
    { x: MARGIN, y: footerY, font: regular, size: 7, color: C.gray }
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
