import { NextResponse } from "next/server";
import { z } from "zod";
import { buildWalksLeftShareUrl } from "@/lib/walks-left-share";

const requestSchema = z.object({
  name: z.string().trim().min(1).max(64),
  breed: z.string().trim().min(1).max(80),
  walks: z.number().int().nonnegative().max(1_000_000),
  weekends: z.number().int().nonnegative().max(100_000),
  sunsets: z.number().int().nonnegative().max(1_000_000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid share payload." }, { status: 400 });
  }

  const baseUrl = "https://www.fursbliss.com";
  const url = buildWalksLeftShareUrl(baseUrl, parsed.data);

  return NextResponse.json({ ok: true, url });
}
