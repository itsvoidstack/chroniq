"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MediaType, LibraryStatus } from "@/generated/prisma/enums";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ─── Add / Upsert ─────────────────────────────────────────────────────────────

export interface AddToLibraryInput {
  mediaType: MediaType;
  anilistId?: number;
  tmdbId?: number;
  jikanId?: number;
  title: string;
  coverImage?: string;
  totalCount?: number;
  status?: LibraryStatus;
}

export async function addToLibrary(input: AddToLibraryInput) {
  const userId = await getAuthUserId();

  const defaultStatus: LibraryStatus =
    input.mediaType === "MANGA" ? "READING" : "WATCHING";

  // Build unique where clause — prefer anilistId, then tmdbId
  const uniqueWhere = input.anilistId
    ? { userId_mediaType_anilistId: { userId, mediaType: input.mediaType, anilistId: input.anilistId } }
    : { userId_mediaType_tmdbId: { userId, mediaType: input.mediaType, tmdbId: input.tmdbId! } };

  const entry = await prisma.libraryEntry.upsert({
    where: uniqueWhere,
    create: {
      userId,
      mediaType: input.mediaType,
      anilistId: input.anilistId ?? null,
      tmdbId: input.tmdbId ?? null,
      jikanId: input.jikanId ?? null,
      title: input.title,
      coverImage: input.coverImage ?? null,
      totalCount: input.totalCount ?? null,
      status: input.status ?? defaultStatus,
      progress: 0,
    },
    update: {
      // Only update metadata if re-adding
      title: input.title,
      coverImage: input.coverImage ?? undefined,
      totalCount: input.totalCount ?? undefined,
      ...(input.status && { status: input.status }),
    },
  });

  revalidatePath("/library");
  revalidatePath("/home");
  return { success: true, entry };
}

// ─── Update Status ────────────────────────────────────────────────────────────

export async function updateStatus(entryId: string, status: LibraryStatus) {
  const userId = await getAuthUserId();

  const entry = await prisma.libraryEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) throw new Error("Entry not found");

  const updates: Record<string, unknown> = { status };

  // Auto-set finish date when completing
  if (status === "COMPLETED") {
    updates.finishDate = new Date();
    // Auto-fill progress to total if known
    if (entry.totalCount && entry.progress < entry.totalCount) {
      updates.progress = entry.totalCount;
    }
  }
  // Auto-set start date when starting to watch
  if ((status === "WATCHING" || status === "READING") && !entry.startDate) {
    updates.startDate = new Date();
  }

  const updated = await prisma.libraryEntry.update({
    where: { id: entryId },
    data: updates,
  });

  revalidatePath("/library");
  revalidatePath("/home");
  return { success: true, entry: updated };
}

// ─── Update Progress ──────────────────────────────────────────────────────────

export async function updateProgress(entryId: string, progress: number) {
  const userId = await getAuthUserId();

  const entry = await prisma.libraryEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) throw new Error("Entry not found");

  const clampedProgress = Math.max(0, progress);

  const updates: Record<string, unknown> = { progress: clampedProgress };

  // Auto-complete if progress hits total
  if (entry.totalCount && clampedProgress >= entry.totalCount) {
    updates.status = "COMPLETED";
    updates.finishDate = new Date();
  }

  // Auto-set start date on first progress
  if (clampedProgress > 0 && !entry.startDate) {
    updates.startDate = new Date();
  }

  // Log a history event
  const updated = await prisma.libraryEntry.update({
    where: { id: entryId },
    data: updates,
  });

  // Create history event for the new episode/chapter
  if (clampedProgress > entry.progress) {
    await prisma.historyEvent.create({
      data: {
        userId,
        libraryEntryId: entryId,
        mediaType: entry.mediaType,
        title: entry.title,
        coverImage: entry.coverImage,
        episodeNumber: ["ANIME", "TV", "MOVIE"].includes(entry.mediaType)
          ? clampedProgress
          : null,
        chapterNumber: entry.mediaType === "MANGA" ? clampedProgress : null,
        source: "MANUAL",
      },
    });
  }

  revalidatePath("/library");
  revalidatePath("/home");
  revalidatePath("/history");
  return { success: true, entry: updated };
}

// ─── Update Score ─────────────────────────────────────────────────────────────

export async function updateScore(entryId: string, score: number | null) {
  const userId = await getAuthUserId();

  const entry = await prisma.libraryEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) throw new Error("Entry not found");

  const clampedScore = score !== null ? Math.min(10, Math.max(1, score)) : null;

  const updated = await prisma.libraryEntry.update({
    where: { id: entryId },
    data: { score: clampedScore },
  });

  revalidatePath("/library");
  return { success: true, entry: updated };
}

// ─── Update Notes ─────────────────────────────────────────────────────────────

export async function updateNotes(entryId: string, notes: string) {
  const userId = await getAuthUserId();

  const entry = await prisma.libraryEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) throw new Error("Entry not found");

  await prisma.libraryEntry.update({
    where: { id: entryId },
    data: { notes },
  });

  revalidatePath("/library");
  return { success: true };
}

// ─── Remove ───────────────────────────────────────────────────────────────────

export async function removeFromLibrary(entryId: string) {
  const userId = await getAuthUserId();

  const entry = await prisma.libraryEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) throw new Error("Entry not found");

  await prisma.libraryEntry.delete({ where: { id: entryId } });

  revalidatePath("/library");
  revalidatePath("/home");
  return { success: true };
}

// ─── Get Library ──────────────────────────────────────────────────────────────

export async function getLibraryCounts(userId: string) {
  const counts = await prisma.libraryEntry.groupBy({
    by: ["mediaType", "status"],
    where: { userId },
    _count: true,
  });
  return counts;
}
