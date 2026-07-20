import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MediaType, EventSource } from "@/generated/prisma/enums";

const PAGE_SIZE = 30;

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const mediaType = p.get("mediaType") as MediaType | null;
  const source    = p.get("source") as EventSource | null;
  const cursor    = p.get("cursor"); // last event id for cursor pagination
  const limit     = Math.min(Number(p.get("limit") ?? PAGE_SIZE), 100);

  const events = await prisma.historyEvent.findMany({
    where: {
      userId: user.id,
      ...(mediaType && { mediaType }),
      ...(source    && { source }),
      ...(cursor    && { id: { lt: cursor } }), // events older than cursor
    },
    orderBy: { watchedAt: "desc" },
    take: limit + 1, // fetch one extra to detect hasMore
  });

  const hasMore = events.length > limit;
  const page    = hasMore ? events.slice(0, limit) : events;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return NextResponse.json({
    events: page.map((e) => ({
      id:            e.id,
      mediaType:     e.mediaType,
      title:         e.title,
      coverImage:    e.coverImage,
      episodeNumber: e.episodeNumber,
      chapterNumber: e.chapterNumber,
      source:        e.source,
      siteName:      e.siteName,
      siteUrl:       e.siteUrl,
      watchedAt:     e.watchedAt,
      libraryEntryId: e.libraryEntryId,
    })),
    nextCursor,
    hasMore,
  });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const event = await prisma.historyEvent.findUnique({ where: { id } });
  if (!event || event.userId !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.historyEvent.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
