import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

const schema = z.object({
  notes: z.string().optional(),
});

type RouteParams = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(request, `ai-notes:${session.user.id}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many updates. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)),
        },
      }
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  const recommendation = await prisma.recommendation.findFirst({
    where: { id: params.id, pet: { userId: session.user.id } },
  });

  if (!recommendation) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const updated = await prisma.recommendation.update({
    where: { id: params.id },
    data: { notes: parsed.data.notes ?? "" },
  });

  return NextResponse.json(updated);
}
