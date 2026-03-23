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
const RESEND_MIN_INTERVAL_MS = 600;
const RESEND_429_RETRY_DELAY_MS = 2000;

let resendSendChain: Promise<void> = Promise.resolve();
let resendLastSendAt = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForResendRateLimitSlot() {
  let releaseCurrent!: () => void;
  const previous = resendSendChain;
  resendSendChain = new Promise<void>((resolve) => {
    releaseCurrent = () => resolve();
  });

  await previous;

  const elapsedSinceLastSend = Date.now() - resendLastSendAt;
  const waitMs = Math.max(0, RESEND_MIN_INTERVAL_MS - elapsedSinceLastSend);
  if (waitMs > 0) {
    await sleep(waitMs);
  }

  resendLastSendAt = Date.now();
  releaseCurrent();
}

function isResend429(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybe = error as {
    statusCode?: number;
    status?: number;
    code?: string;
    name?: string;
    message?: string;
  };

  if (maybe.statusCode === 429 || maybe.status === 429) {
    return true;
  }

  const text = [maybe.code, maybe.name, maybe.message].filter(Boolean).join(" ").toLowerCase();
  return text.includes("429") || text.includes("too many requests") || text.includes("rate limit");
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return String(error);
}

async function sendWithResend(payload: EmailPayload) {
  if (!resend) {
    console.warn("Resend not configured. Skipping email send.");
    return { queued: false, messageId: null as string | null };
  }

  await waitForResendRateLimitSlot();
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
    throw result.error;
  }

  return { queued: true, messageId: result.data?.id ?? null };
}

export async function sendEmail(payload: EmailPayload) {
  try {
    return await sendWithResend(payload);
  } catch (error) {
    if (isResend429(error)) {
      await sleep(RESEND_429_RETRY_DELAY_MS);
      try {
        return await sendWithResend(payload);
      } catch (retryError) {
        throw new Error(toErrorMessage(retryError));
      }
    }
    throw new Error(toErrorMessage(error));
  }
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

export async function sendDailyHealthReminderEmail(
  email: string,
  petName: string,
  options?: { daysSinceLastLog?: number; lastLogDate?: Date }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
  const logUrl = `${appUrl}/logs/new`;
  const daysSince = options?.daysSinceLastLog ?? 0;
  const lastLogDate = options?.lastLogDate;

  const isStale = daysSince >= 3;
  const dateStr = lastLogDate
    ? lastLogDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  const subject = `How's ${petName} doing today?`;
  const staleLine = isStale
    ? `You haven't logged since ${dateStr}. Even a quick energy + appetite check helps spot trends.`
    : "Tap to log today's 30-second check-in.";
  const text = `${staleLine} → ${logUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2>How's ${petName} doing today?</h2>
      <p>${staleLine}</p>
      <p>
        <a href="${logUrl}" style="color: #059669; font-weight: 600;">
          Log health check
        </a>
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, text });
}

export async function sendSevenDayInsightEmail(
  email: string,
  petName: string,
  insight: { avgEnergy: number; avgAppetite: number; avgMobility: number; mobilityDipped?: boolean }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
  const dashboardUrl = `${appUrl}/dashboard`;
  const subject = `${petName}'s first weekly health snapshot is ready`;
  const mobilityNote = insight.mobilityDipped
    ? ` Mobility dipped this week — keep watching.`
    : "";
  const text = `${petName}'s first week of data: Energy averaged ${insight.avgEnergy.toFixed(1)}, Appetite ${insight.avgAppetite.toFixed(1)}, Mobility ${insight.avgMobility.toFixed(1)}.${mobilityNote} Keep logging to unlock your full 30-day Vet Summary Report. → ${dashboardUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2>${petName}'s first weekly health snapshot is ready</h2>
      <p>Your first week of data:</p>
      <ul style="margin: 16px 0;">
        <li>Energy averaged ${insight.avgEnergy.toFixed(1)}/10</li>
        <li>Appetite averaged ${insight.avgAppetite.toFixed(1)}/10</li>
        <li>Mobility averaged ${insight.avgMobility.toFixed(1)}/10</li>
      </ul>
      ${insight.mobilityDipped ? `<p style="color: #b45309;">Mobility dipped this week — keep watching.</p>` : ""}
      <p>Keep logging to unlock your full 30-day Vet Summary Report.</p>
      <p>
        <a href="${dashboardUrl}" style="color: #059669; font-weight: 600;">
          View dashboard
        </a>
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, text });
}
