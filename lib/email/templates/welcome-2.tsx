type WelcomeTwoTemplateInput = {
  dogName: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
};

export function buildWelcomeEmailTwo(input: WelcomeTwoTemplateInput) {
  const subject = "The one thing most owners miss about senior dogs";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin:0 0 8px;">The one thing most owners miss about senior dogs</h2>
      <p style="margin:0 0 10px;">
        Early mobility decline is usually subtle: slower transitions, less willingness to jump,
        shorter play bursts, and longer recovery after walks.
      </p>
      <p style="margin:0 0 10px;">
        These small signals are easy to miss in day-to-day life, but they become clear when tracked over time.
      </p>
      <p style="margin:0 0 14px;">
        <a href="${input.dashboardUrl}" style="display:inline-block;background:#0D6E6E;color:#FFFFFF;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">
          Start tracking ${input.dogName}'s health today
        </a>
      </p>
      <p style="margin:18px 0 0;font-size:12px;color:#6B7280;">
        <a href="${input.unsubscribeUrl}" style="color:#6B7280;">Unsubscribe</a>
      </p>
    </div>
  `;

  const text = `The one thing most owners miss about senior dogs

Early mobility decline is usually subtle: slower transitions, less willingness to jump,
shorter play bursts, and longer recovery after walks.

Track daily signals so trends become visible sooner.

Start tracking ${input.dogName}'s health today: ${input.dashboardUrl}

Unsubscribe: ${input.unsubscribeUrl}`;

  return { subject, html, text };
}
