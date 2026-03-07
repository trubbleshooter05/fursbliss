import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
    });

    if (!user || !isSubscriptionActive(user)) {
      return new Response(JSON.stringify({ message: "Premium required." }), { status: 403 });
    }

    const { petId } = await params;

    // Verify pet ownership
    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: session.user.id },
      select: { id: true },
    });

    if (!pet) {
      return new Response(JSON.stringify({ message: "Pet not found." }), { status: 404 });
    }

    const body = await request.json() as { reportData: unknown };
    if (!body.reportData) {
      return new Response(JSON.stringify({ message: "reportData required." }), { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const vetReport = await prisma.vetReport.create({
      data: {
        petId,
        userId: session.user.id,
        reportData: body.reportData as object,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://fursbliss.com";
    const url = `${baseUrl}/vet-report/${vetReport.id}`;

    return new Response(JSON.stringify({ url, id: vetReport.id, expiresAt: expiresAt.toISOString() }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Vet report share failed:", error);
    return new Response(JSON.stringify({ message: "Failed to create share link." }), { status: 500 });
  }
}
