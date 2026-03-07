import PDFDocument from "pdfkit";
import type { VetReadyReport } from "@/app/api/pets/[petId]/vet-report/route";

// Sanitize to ASCII-safe text for PDF
function s(value: string): string {
  return value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

const COLORS = {
  black: "#111111",
  gray: "#6B7280",
  lightGray: "#D1D5DB",
  bgGray: "#F9FAFB",
  red: "#DC2626",
  yellow: "#D97706",
  green: "#16A34A",
  accent: "#1E40AF", // deep blue for header
};

const MARGIN = 45;
const PAGE_WIDTH = 612;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function trendArrow(trend: "improving" | "declining" | "stable"): string {
  if (trend === "improving") return "(+)";
  if (trend === "declining") return "(-)";
  return "(=)";
}

function severityLabel(severity: "high" | "medium" | "low"): string {
  if (severity === "high") return "[HIGH]";
  if (severity === "medium") return "[MOD]";
  return "[LOW]";
}

function alertLabel(level: "red" | "yellow" | "green"): string {
  if (level === "red") return "[!]";
  if (level === "yellow") return "[~]";
  return "[OK]";
}

export async function generateVetReportPDF(report: VetReadyReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: MARGIN,
      info: {
        Title: `FursBliss Vet-Ready Health Summary - ${report.pet.name}`,
        Author: "FursBliss",
        Subject: "Veterinary Health Summary",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = MARGIN;

    // ── HEADER ────────────────────────────────────────────────────────────────
    // Blue header bar
    doc.rect(0, 0, PAGE_WIDTH, 62).fill(COLORS.accent);

    doc
      .fillColor("white")
      .fontSize(15)
      .font("Helvetica-Bold")
      .text(s("FursBliss Vet-Ready Health Summary"), MARGIN, 14, { width: CONTENT_WIDTH });

    doc
      .fillColor("white")
      .fontSize(8.5)
      .font("Helvetica")
      .text(
        s(`${report.pet.name}  |  ${report.period.start} - ${report.period.end}  |  Generated: ${new Date(report.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`),
        MARGIN,
        36,
        { width: CONTENT_WIDTH }
      );

    y = 76;

    // ── SECTION 1: Pet Info ───────────────────────────────────────────────────
    doc.fillColor(COLORS.black).fontSize(9).font("Helvetica-Bold");
    doc.text(s("PATIENT INFORMATION"), MARGIN, y);
    y += 12;

    // Draw a thin rule
    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_WIDTH, y).strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
    y += 5;

    const weightTrendSymbol =
      report.pet.weight.trend === "gaining" ? "(+)" : report.pet.weight.trend === "losing" ? "(-)" : "(=)";
    const weightLine =
      report.pet.weight.thirtyDaysAgo
        ? `${report.pet.weight.current} lbs ${weightTrendSymbol}  (30-day: ${report.pet.weight.thirtyDaysAgo} lbs)`
        : `${report.pet.weight.current} lbs`;

    const petInfoCols = [
      [`Name: ${s(report.pet.name)}`, `Breed: ${s(report.pet.breed)}`],
      [`Age: ${s(report.pet.age)}`, `Weight: ${s(weightLine)}`],
    ];

    doc.fillColor(COLORS.black).fontSize(8.5).font("Helvetica");
    const colW = CONTENT_WIDTH / 2;
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 2; row++) {
        doc.text(s(petInfoCols[col][row]), MARGIN + col * colW, y + row * 13, { width: colW - 10 });
      }
    }

    // Tracking stats (right-aligned block)
    const statsX = MARGIN + colW;
    doc
      .fillColor(COLORS.gray)
      .fontSize(7.5)
      .text(
        s(`Tracking: ${report.period.totalDaysLogged}/30 days (${report.period.logCompletionRate}% completion)`),
        statsX,
        y + 26,
        { width: colW - 10, align: "right" }
      );

    y += 42;

    // ── SECTION 2: 30-Day Health Trends ──────────────────────────────────────
    doc.fillColor(COLORS.black).fontSize(9).font("Helvetica-Bold");
    doc.text(s("30-DAY HEALTH TRENDS  (W1 = oldest, W4 = most recent, scale 1-10)"), MARGIN, y);
    y += 11;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_WIDTH, y).strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
    y += 4;

    // Table header
    const colWidths = [90, 55, 55, 55, 55, 80, 82];
    const headers = ["Metric", "W1 Avg", "W2 Avg", "W3 Avg", "W4 Avg", "30-Day Avg", "Trend"];
    let xPos = MARGIN;

    doc.fillColor(COLORS.gray).fontSize(7.5).font("Helvetica-Bold");
    headers.forEach((h, i) => {
      doc.text(s(h), xPos, y, { width: colWidths[i] - 4 });
      xPos += colWidths[i];
    });
    y += 12;

    // Table rows
    const metricRows: Array<{
      label: string;
      data: VetReadyReport["trends"]["energy"];
    }> = [
      { label: "Energy", data: report.trends.energy },
      { label: "Appetite", data: report.trends.appetite },
      { label: "Mobility", data: report.trends.mobility },
      { label: "Mood", data: report.trends.mood },
    ];

    metricRows.forEach((row, idx) => {
      // Alternating row bg
      if (idx % 2 === 0) {
        doc.rect(MARGIN, y - 1, CONTENT_WIDTH, 13).fill("#F3F4F6").fillColor(COLORS.black);
      }

      const trendColor =
        row.data.trend === "declining"
          ? COLORS.red
          : row.data.trend === "improving"
          ? COLORS.green
          : COLORS.black;

      xPos = MARGIN;
      const cells = [
        { text: row.label, color: COLORS.black, bold: true },
        { text: row.data.weekOverWeek[0] > 0 ? String(row.data.weekOverWeek[0]) : "-", color: COLORS.black, bold: false },
        { text: row.data.weekOverWeek[1] > 0 ? String(row.data.weekOverWeek[1]) : "-", color: COLORS.black, bold: false },
        { text: row.data.weekOverWeek[2] > 0 ? String(row.data.weekOverWeek[2]) : "-", color: COLORS.black, bold: false },
        { text: row.data.weekOverWeek[3] > 0 ? String(row.data.weekOverWeek[3]) : "-", color: COLORS.black, bold: false },
        { text: row.data.average > 0 ? String(row.data.average) : "-", color: COLORS.black, bold: false },
        { text: `${trendArrow(row.data.trend)} ${row.data.trend}`, color: trendColor, bold: false },
      ];

      cells.forEach((cell, i) => {
        doc
          .fillColor(cell.color)
          .fontSize(8)
          .font(cell.bold ? "Helvetica-Bold" : "Helvetica")
          .text(s(cell.text), xPos, y, { width: colWidths[i] - 4 });
        xPos += colWidths[i];
      });

      y += 13;
    });

    // Stool row
    const stoolText =
      report.trends.stool.abnormalDays + report.trends.stool.normalDays > 0
        ? `Normal: ${report.trends.stool.normalDays}d  Abnormal: ${report.trends.stool.abnormalDays}d`
        : "No gut health logs";
    doc
      .fillColor(COLORS.gray)
      .fontSize(7.5)
      .font("Helvetica")
      .text(s(`Gut/Stool: ${stoolText}`), MARGIN, y, { width: CONTENT_WIDTH });
    y += 13;

    // ── SECTION 3: Flagged Concerns ───────────────────────────────────────────
    doc.fillColor(COLORS.black).fontSize(9).font("Helvetica-Bold");
    doc.text(s("FLAGGED CONCERNS"), MARGIN, y);
    y += 11;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_WIDTH, y).strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
    y += 4;

    if (report.concerns.length === 0) {
      doc.fillColor(COLORS.green).fontSize(8).font("Helvetica");
      doc.text(s("No concerning patterns detected in the 30-day window."), MARGIN, y);
      y += 13;
    } else {
      for (const concern of report.concerns) {
        const labelColor =
          concern.severity === "high" ? COLORS.red : concern.severity === "medium" ? COLORS.yellow : COLORS.gray;
        const label = severityLabel(concern.severity);

        // Severity badge
        doc.fillColor(labelColor).fontSize(7.5).font("Helvetica-Bold");
        const labelWidth = 30;
        doc.text(s(label), MARGIN, y, { width: labelWidth });

        // Category + description
        doc.fillColor(COLORS.black).fontSize(8).font("Helvetica-Bold");
        doc.text(s(`${concern.category}:`), MARGIN + labelWidth + 2, y, { width: 100 });

        doc.fillColor(COLORS.black).fontSize(7.5).font("Helvetica");
        doc.text(s(concern.description), MARGIN + labelWidth + 106, y, {
          width: CONTENT_WIDTH - labelWidth - 108,
        });

        // Estimate height used
        const lines = Math.ceil(concern.description.length / 82);
        y += Math.max(12, lines * 9 + 3);
      }
    }

    y += 2;

    // ── SECTION 4: Discussion Topics ──────────────────────────────────────────
    doc.fillColor(COLORS.black).fontSize(9).font("Helvetica-Bold");
    doc.text(s("RECOMMENDED DISCUSSION TOPICS FOR VET VISIT"), MARGIN, y);
    y += 11;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_WIDTH, y).strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
    y += 4;

    if (report.discussionTopics.length === 0) {
      doc.fillColor(COLORS.gray).fontSize(8).font("Helvetica");
      doc.text(s("No specific discussion topics generated. Continue routine monitoring."), MARGIN, y);
      y += 13;
    } else {
      report.discussionTopics.forEach((topic, i) => {
        doc.fillColor(COLORS.accent).fontSize(8).font("Helvetica-Bold");
        doc.text(s(`${i + 1}.`), MARGIN, y, { width: 14 });
        doc.fillColor(COLORS.black).fontSize(8).font("Helvetica");
        doc.text(s(topic), MARGIN + 16, y, { width: CONTENT_WIDTH - 16 });
        const lines = Math.ceil(topic.length / 90);
        y += Math.max(12, lines * 9 + 3);
      });
    }

    y += 2;

    // ── SECTION 5: Weekly Check-In Summary ───────────────────────────────────
    doc.fillColor(COLORS.black).fontSize(9).font("Helvetica-Bold");
    doc.text(s("WEEKLY CHECK-IN SUMMARY"), MARGIN, y);
    y += 11;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_WIDTH, y).strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
    y += 4;

    const ci = report.weeklyCheckIns;
    const ciLine1 = `Completed: ${ci.completed} of ${ci.totalPossible} check-ins  |  Vet visits reported: ${ci.vetVisitsReported}  |  New symptoms reported: ${ci.newSymptomsReported ? "Yes" : "No"}`;
    doc.fillColor(COLORS.black).fontSize(8).font("Helvetica");
    doc.text(s(ciLine1), MARGIN, y, { width: CONTENT_WIDTH });
    y += 11;

    if (ci.symptomDetails.length > 0) {
      doc.fillColor(COLORS.gray).fontSize(7.5);
      doc.text(s(`Symptom notes: ${ci.symptomDetails.slice(0, 3).join("; ")}`), MARGIN, y, { width: CONTENT_WIDTH });
      y += 11;
    }

    y += 2;

    // ── SECTION 6: Supplements / Medications ─────────────────────────────────
    doc.fillColor(COLORS.black).fontSize(9).font("Helvetica-Bold");
    doc.text(s("CURRENT MEDICATIONS & SUPPLEMENTS"), MARGIN, y);
    y += 11;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_WIDTH, y).strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
    y += 4;

    if (report.supplements.length === 0) {
      doc.fillColor(COLORS.gray).fontSize(8).font("Helvetica");
      doc.text(s("None recorded."), MARGIN, y);
      y += 13;
    } else {
      const suppColW = CONTENT_WIDTH / 3;
      report.supplements.forEach((sup, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        doc.fillColor(COLORS.black).fontSize(8).font("Helvetica");
        doc.text(s(`• ${sup.name} (${sup.dosage})`), MARGIN + col * suppColW, y + row * 12, {
          width: suppColW - 8,
        });
      });
      y += Math.ceil(report.supplements.length / 3) * 12 + 2;
    }

    // Alert history (compact, only if space and any alerts exist)
    if (report.alerts.length > 0 && y < 680) {
      y += 4;
      doc.fillColor(COLORS.black).fontSize(9).font("Helvetica-Bold");
      doc.text(s("RECENT HEALTH ALERTS (30 days)"), MARGIN, y);
      y += 11;
      doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_WIDTH, y).strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
      y += 4;

      const alertsToShow = report.alerts.slice(0, 5);
      alertsToShow.forEach((alert) => {
        const alertColor = alert.level === "red" ? COLORS.red : alert.level === "yellow" ? COLORS.yellow : COLORS.green;
        doc.fillColor(alertColor).fontSize(7.5).font("Helvetica-Bold");
        doc.text(s(`${alertLabel(alert.level)} ${alert.date}`), MARGIN, y, { width: 80 });
        doc.fillColor(COLORS.black).fontSize(7.5).font("Helvetica");
        doc.text(s(alert.reason.slice(0, 100)), MARGIN + 82, y, { width: CONTENT_WIDTH - 82 });
        y += 12;
      });
    }

    // ── FOOTER ─────────────────────────────────────────────────────────────────
    const footerY = 762;
    doc.moveTo(MARGIN, footerY - 6).lineTo(MARGIN + CONTENT_WIDTH, footerY - 6).strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
    doc
      .fillColor(COLORS.gray)
      .fontSize(6.5)
      .font("Helvetica")
      .text(
        s("Generated by FursBliss  |  www.fursbliss.com  |  This summary reflects owner-recorded observations only. It is not a veterinary diagnosis. Discuss all findings with your veterinarian."),
        MARGIN,
        footerY,
        { width: CONTENT_WIDTH, align: "center" }
      );

    doc.end();
  });
}
