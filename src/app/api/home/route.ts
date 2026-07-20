import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [continueWatching, recentlyAdded, recentActivity] = await Promise.all([
    // In-progress entries (have progress > 0, not completed/dropped)
    prisma.libraryEntry.findMany({
      where: {
        userId: user.id,
        status: { in: ["WATCHING", "READING"] },
        progress: { gt: 0 },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),

    // Recently added to library
    prisma.libraryEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),

    // Recent history events
    prisma.historyEvent.findMany({
      where: { userId: user.id },
      orderBy: { watchedAt: "desc" },
      take: 8,
    }),
  ]);

  return NextResponse.json({ continueWatching, recentlyAdded, recentActivity });
}
