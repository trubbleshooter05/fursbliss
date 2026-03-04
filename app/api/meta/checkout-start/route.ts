import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendMetaServerEvent } from "@/lib/meta-capi";

type RequestBody = {
  source?: string;
  value?: number;
  contentName?: string;
  href?: string;
  eventIdBase?: string;
};

function parseCookieValue(cookieHeader: string | null, key: string) {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";").map((part) => part.trim());
  for (const pair of pairs) {
    if (!pair.startsWith(`${key}=`)) continue;
    return decodeURIComponent(pair.slice(key.length + 1));
  }
  return null;
}

export async function POST(request: Request) {
  let body: RequestBody = {};
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    // no-op
  }

  const source = (body.source ?? "checkout").toString();
  const value = typeof body.value === "number" ? body.value : 9;
  const contentName =
    typeof body.contentName === "string" ? body.contentName : "FursBliss Premium Monthly";
  const eventSourceUrl = body.href
    ? new URL(body.href, process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com").toString()
    : `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com"}/${source}`;
  const eventIdBase =
    typeof body.eventIdBase === "string" && body.eventIdBase.trim().length > 0
      ? body.eventIdBase
      : randomUUID();
  const cookieHeader = request.headers.get("cookie");
  const fbp = parseCookieValue(cookieHeader, "_fbp");
  const fbc = parseCookieValue(cookieHeader, "_fbc");
  const clientIpAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    null;

  const session = await auth();
  const userEmail = session?.user?.id
    ? (
        await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true },
        })
      )?.email
    : null;

  await Promise.allSettled([
    sendMetaServerEvent({
      eventName: "InitiateCheckout",
      eventSourceUrl,
      value,
      contentName,
      email: userEmail,
      userAgent: request.headers.get("user-agent"),
      clientIpAddress,
      fbp,
      fbc,
      eventId: `${eventIdBase}:initiate`,
    }),
    sendMetaServerEvent({
      eventName: "StartedCheckout",
      eventSourceUrl,
      value,
      contentName,
      email: userEmail,
      userAgent: request.headers.get("user-agent"),
      clientIpAddress,
      fbp,
      fbc,
      eventId: `${eventIdBase}:started`,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
