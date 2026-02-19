import type { LongevityReadinessReportPayload } from "@/lib/longevity/report";

type WelcomeOneTemplateInput = {
  appUrl: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
  reportPayload: LongevityReadinessReportPayload;
  reportDownloadUrl?: string;
};

export function buildWelcomeEmailOne(input: WelcomeOneTemplateInput) {
  const { reportPayload } = input;
  const subject = `Your dog scored ${reportPayload.longevityScore.value}/100 - here's what that means`;
  const dogName = reportPayload.dog.name;
  const interpretation = reportPayload.longevityScore.interpretation;
  const nextSteps = reportPayload.nextSteps;

  const reportCtaHtml = input.reportDownloadUrl
    ? `<p style="margin:14px 0 0;">
         <a href="${input.reportDownloadUrl}" style="color:#0D6E6E;font-weight:700;text-decoration:underline;">
           Download your Longevity Readiness Report
         </a>
       </p>`
    : "";

  const reportCtaText = input.reportDownloadUrl
    ? `\nDownload your Longevity Readiness Report: ${input.reportDownloadUrl}\n`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin:0 0 8px;">${dogName}'s longevity score: ${reportPayload.longevityScore.value}/100</h2>
      <p style="margin:0 0 12px;">${interpretation}</p>
      <p style="margin:0 0 12px;">
        LOY-002 eligibility status: <strong>${reportPayload.loy002Eligibility.statusLabel}</strong><br/>
        <span style="color:#4B5563;">${reportPayload.loy002Eligibility.detail}</span>
      </p>
      <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;padding:12px;margin:12px 0;">
        <p style="margin:0 0 8px;font-weight:700;">Your top next steps</p>
        <ol style="margin:0;padding-left:18px;">
          ${nextSteps.map((s) => `<li style="margin:0 0 6px;">${s}</li>`).join("")}
        </ol>
      </div>
      <p style="margin:0 0 14px;">
        <a href="${input.dashboardUrl}" style="display:inline-block;background:#0D6E6E;color:#FFFFFF;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">
          Log your first daily health check
        </a>
      </p>
      ${reportCtaHtml}
      <p style="margin:18px 0 0;font-size:12px;color:#6B7280;">
        You are receiving this because you signed up at FursBliss (${input.appUrl}).
      </p>
      <p style="margin:6px 0 0;font-size:12px;color:#6B7280;">
        <a href="${input.unsubscribeUrl}" style="color:#6B7280;">Unsubscribe</a>
      </p>
    </div>
  `;

  const text = `${dogName}'s longevity score: ${reportPayload.longevityScore.value}/100

${interpretation}

LOY-002 eligibility: ${reportPayload.loy002Eligibility.statusLabel}
${reportPayload.loy002Eligibility.detail}

Top next steps:
1) ${nextSteps[0] ?? ""}
2) ${nextSteps[1] ?? ""}
3) ${nextSteps[2] ?? ""}

Log your first daily health check: ${input.dashboardUrl}
${reportCtaText}
Unsubscribe: ${input.unsubscribeUrl}`;

  return { subject, html, text };
}
