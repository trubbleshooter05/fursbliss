import { Resend } from "resend";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL ?? "FursBliss <hello@fursbliss.com>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail(payload: EmailPayload) {
  if (!resend) {
    console.warn("Resend not configured. Skipping email send.");
    return { queued: false, messageId: null as string | null };
  }

  const result = await resend.emails.send({
    from: resendFrom,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    headers: payload.idempotencyKey
      ? {
          "Idempotency-Key": payload.idempotencyKey,
        }
      : undefined,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { queued: true, messageId: result.data?.id ?? null };
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  const subject = "Verify your FursBliss account";
  const text = `Welcome to FursBliss!\n\nVerify your email to activate your account:\n${verifyUrl}\n\nIf you did not sign up, you can ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2>Welcome to FursBliss</h2>
      <p>Verify your email to activate your account.</p>
      <p>
        <a href="${verifyUrl}" style="color: #059669; font-weight: 600;">Verify your email</a>
      </p>
      <p style="font-size: 12px; color: #6B7280;">
        If you did not sign up, you can ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, text });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = "Reset your FursBliss password";
  const text = `We received a request to reset your password.\n\nReset it here:\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2>Password reset</h2>
      <p>Reset your password using the link below.</p>
      <p>
        <a href="${resetUrl}" style="color: #059669; font-weight: 600;">Reset your password</a>
      </p>
      <p style="font-size: 12px; color: #6B7280;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, text });
}

export async function sendReminderEmail(
  email: string,
  subject: string,
  bodyLines: string[]
) {
  const text = `${bodyLines.join("\n")}\n\nLog in to FursBliss for details.`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2>${subject}</h2>
      <ul>
        ${bodyLines.map((line) => `<li>${line}</li>`).join("")}
      </ul>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #059669; font-weight: 600;">
          Open FursBliss
        </a>
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, text });
}
