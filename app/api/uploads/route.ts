import { NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(request, `uploads:${session.user.id}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many uploads. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)),
        },
      }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ message: "No file provided" }, { status: 400 });
  }

  const extension = file.type.split("/")[1] ?? "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const blob = await put(`pets/${fileName}`, file, {
    access: "public",
    contentType: file.type || "image/jpeg",
  });

  return NextResponse.json({ url: blob.url });
}
