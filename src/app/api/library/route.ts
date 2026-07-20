import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MediaType, LibraryStatus } from "@/generated/prisma/enums";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const mediaType = p.get("mediaType") as MediaType | null;
  const status = p.get("status") as LibraryStatus | null;
  const entryId = p.get("entryId");

  // Single entry lookup (for AddToLibraryButton status check)
  if (entryId) {
    const entry = await prisma.libraryEntry.findFirst({
      where: { id: entryId, userId: user.id },
    });
    return NextResponse.json({ entry });
  }

  // Check if a specific media item is in library
  const anilistId = p.get("anilistId");
  const tmdbId = p.get("tmdbId");
  if (anilistId || tmdbId) {
    const entry = await prisma.libraryEntry.findFirst({
      where: {
        userId: user.id,
        ...(mediaType && { mediaType }),
        ...(anilistId && { anilistId: Number(anilistId) }),
        ...(tmdbId && { tmdbId: Number(tmdbId) }),
      },
    });
    return NextResponse.json({ entry });
  }

  // Full library fetch with optional filters
  const entries = await prisma.libraryEntry.findMany({
    where: {
      userId: user.id,
      ...(mediaType && { mediaType }),
      ...(status && { status }),
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ entries });
}
