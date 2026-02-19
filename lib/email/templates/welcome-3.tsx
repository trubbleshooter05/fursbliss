type WelcomeThreeTemplateInput = {
  dogName: string;
  pricingUrl: string;
  unsubscribeUrl: string;
  eligibilityLabel: string;
};

export function buildWelcomeEmailThree(input: WelcomeThreeTemplateInput) {
  const subject = `${input.dogName} is LOY-002 eligible - here's how to prepare`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin:0 0 8px;">${input.dogName} and LOY-002 readiness</h2>
      <p style="margin:0 0 10px;">
        Current status: <strong>${input.eligibilityLabel}</strong>
      </p>
      <p style="margin:0 0 8px;">
        Free users get notified. Premium users get prepared.
      </p>
      <ul style="margin:0 0 14px;padding-left:18px;">
        <li style="margin-bottom:6px;">Complete health history your vet can review on day one</li>
        <li style="margin-bottom:6px;">Vet-ready documentation and longevity reports</li>
        <li style="margin-bottom:6px;">LOY-002 eligibility verification tracked over time</li>
        <li style="margin-bottom:6px;">AI-powered interaction checker for medications and supplements</li>
      </ul>
      <p style="margin:0 0 14px;">
        <a href="${input.pricingUrl}" style="display:inline-block;background:#0D6E6E;color:#FFFFFF;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">
          Upgrade to Premium
        </a>
      </p>
      <p style="margin:18px 0 0;font-size:12px;color:#6B7280;">
        <a href="${input.unsubscribeUrl}" style="color:#6B7280;">Unsubscribe</a>
      </p>
    </div>
  `;

  const text = `${input.dogName} and LOY-002 readiness

Current status: ${input.eligibilityLabel}

Free users get notified. Premium users get prepared.

Premium includes:
- Complete health history your vet can review on day one
- Vet-ready documentation and longevity reports
- LOY-002 eligibility verification tracked over time
- AI-powered interaction checker for medications and supplements

Upgrade to Premium: ${input.pricingUrl}
Unsubscribe: ${input.unsubscribeUrl}`;

  return { subject, html, text };
}
