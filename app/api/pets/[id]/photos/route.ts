import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FREE_PHOTO_LIMIT = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];

const VALID_CATEGORIES = ["lump", "skin", "eye", "teeth", "wound", "mobility", "other"];

// POST /api/pets/[id]/photos — upload a new photo
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: petId } = await params;

  // Verify pet ownership
  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: session.user.id },
    select: { id: true },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
  });
  const isPremium = isSubscriptionActive(user ?? {});

  // Free users: enforce 3-photo limit
  if (!isPremium) {
    const count = await prisma.petPhoto.count({
      where: { petId, userId: session.user.id },
    });
    if (count >= FREE_PHOTO_LIMIT) {
      return NextResponse.json(
        {
          message: `Free accounts can store up to ${FREE_PHOTO_LIMIT} photos per pet. Upgrade to Premium for unlimited photo storage.`,
          limitReached: true,
        },
        { status: 403 }
      );
    }
  }

  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const category = formData.get("category") as string | null;
  const bodyArea = formData.get("bodyArea") as string | null;
  const notes = formData.get("notes") as string | null;
  const takenAtRaw = formData.get("takenAt") as string | null;

  if (!file) {
    return NextResponse.json({ message: "No file provided" }, { status: 400 });
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ message: "Invalid or missing category" }, { status: 400 });
  }

  const contentType = file.type || "image/jpeg";
  if (!ACCEPTED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { message: "Unsupported file type. Use JPG, PNG, WebP, or HEIC." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: "File too large. Maximum size is 5 MB." },
      { status: 400 }
    );
  }

  const takenAt = takenAtRaw ? new Date(takenAtRaw) : new Date();

  // Upload to Vercel Blob
  const blobPath = `pet-photos/${session.user.id}/${petId}/${Date.now()}-${file.name}`;
  const blob = await put(blobPath, file, { access: "public" });

  // Persist to database
  const photo = await prisma.petPhoto.create({
    data: {
      petId,
      userId: session.user.id,
      imageUrl: blob.url,
      category,
      bodyArea: bodyArea ?? null,
      notes: notes?.slice(0, 200) ?? null,
      takenAt,
    },
  });

  return NextResponse.json({ photo }, { status: 201 });
}

// GET /api/pets/[id]/photos — list photos for a pet
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: petId } = await params;

  // Verify pet ownership
  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: session.user.id },
    select: { id: true },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
  });
  const isPremium = isSubscriptionActive(user ?? {});

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

  const photos = await prisma.petPhoto.findMany({
    where: {
      petId,
      userId: session.user.id,
      ...(category && category !== "all" ? { category } : {}),
      ...(from || to
        ? {
            takenAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { takenAt: "desc" },
  });

  // Free users: return only the 3 most recent (already limited on upload, but guard here too)
  const visiblePhotos = isPremium ? photos : photos.slice(0, FREE_PHOTO_LIMIT);

  return NextResponse.json({ photos: visiblePhotos, isPremium, total: photos.length });
}
