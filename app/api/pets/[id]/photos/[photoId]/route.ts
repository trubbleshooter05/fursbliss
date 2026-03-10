import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/pets/[id]/photos/[photoId]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: petId, photoId } = await params;

  const photo = await prisma.petPhoto.findFirst({
    where: { id: photoId, petId, userId: session.user.id },
  });
  if (!photo) {
    return NextResponse.json({ message: "Photo not found" }, { status: 404 });
  }

  // Delete from Vercel Blob
  try {
    await del(photo.imageUrl);
  } catch {
    // Blob deletion is best-effort; continue to remove DB record
  }

  await prisma.petPhoto.delete({ where: { id: photoId } });

  return NextResponse.json({ success: true });
}
