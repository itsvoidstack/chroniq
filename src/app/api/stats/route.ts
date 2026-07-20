import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Average episode runtime in minutes (used for watch time estimation)
const AVG_EPISODE_RUNTIME = 24;
const AVG_MOVIE_RUNTIME   = 110;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = user.id;

  // ── Fetch all library entries ────────────────────────────────────────────
  const entries = await prisma.libraryEntry.findMany({
    where: { userId: uid },
    select: {
      id: true, mediaType: true, status: true,
      progress: true, totalCount: true, score: true,
      title: true, createdAt: true,
    },
  });

  // ── Fetch history events for monthly activity ────────────────────────────
  const events = await prisma.historyEvent.findMany({
    where: { userId: uid },
    select: { watchedAt: true, mediaType: true, episodeNumber: true, chapterNumber: true },
    orderBy: { watchedAt: "asc" },
  });

  // ── Per-type helpers ──────────────────────────────────────────────────────
  const byType = (type: string) => entries.filter((e) => e.mediaType === type);

  // ── Genre counts ──────────────────────────────────────────────────────────
  // We don't store genres in library_entries — compute from entry titles is not feasible.
  // Instead we bucket by mediaType for the genre distribution.

  // ── Score distribution ────────────────────────────────────────────────────
  function scoreDistribution(type?: string) {
    const src = type ? byType(type) : entries;
    const buckets: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) buckets[i] = 0;
    src.forEach((e) => { if (e.score) buckets[Math.round(e.score)] = (buckets[Math.round(e.score)] ?? 0) + 1; });
    return Object.entries(buckets).map(([score, count]) => ({ score: Number(score), count }));
  }

  // ── Monthly activity (last 12 months) ─────────────────────────────────────
  const now = new Date();
  const months: { label: string; episodes: number; chapters: number; movies: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      episodes: 0,
      chapters: 0,
      movies: 0,
    });
  }

  events.forEach((ev) => {
    const d = new Date(ev.watchedAt);
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsAgo < 0 || monthsAgo > 11) return;
    const idx = 11 - monthsAgo;
    if (ev.mediaType === "MANGA")      months[idx].chapters++;
    else if (ev.mediaType === "MOVIE") months[idx].movies++;
    else                               months[idx].episodes++;
  });

  // ── Status distribution ────────────────────────────────────────────────────
  function statusDist(type: string) {
    const statusMap: Record<string, number> = {};
    byType(type).forEach((e) => {
      statusMap[e.status] = (statusMap[e.status] ?? 0) + 1;
    });
    return Object.entries(statusMap).map(([status, count]) => ({ status, count }));
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const animeEntries  = byType("ANIME");
  const movieEntries  = byType("MOVIE");
  const tvEntries     = byType("TV");
  const mangaEntries  = byType("MANGA");

  const episodesWatched = animeEntries.reduce((s, e) => s + e.progress, 0)
    + tvEntries.reduce((s, e) => s + e.progress, 0);
  const moviesWatched   = movieEntries.filter((e) => e.status === "COMPLETED").length;
  const chaptersRead    = mangaEntries.reduce((s, e) => s + e.progress, 0);

  const watchTimeMinutes =
    episodesWatched * AVG_EPISODE_RUNTIME +
    moviesWatched   * AVG_MOVIE_RUNTIME;

  const watchTimeDays = (watchTimeMinutes / 60 / 24).toFixed(1);

  // Mean score overall
  const scored = entries.filter((e) => e.score !== null);
  const meanScore = scored.length
    ? (scored.reduce((s, e) => s + (e.score ?? 0), 0) / scored.length).toFixed(2)
    : null;

  // Completion rate
  const completedCount = entries.filter((e) => e.status === "COMPLETED").length;
  const completionRate = entries.length
    ? Math.round((completedCount / entries.length) * 100)
    : 0;

  // ── Response ───────────────────────────────────────────────────────────────
  return NextResponse.json({
    overview: {
      totalEntries:      entries.length,
      episodesWatched,
      moviesWatched,
      chaptersRead,
      watchTimeMinutes,
      watchTimeDays:     Number(watchTimeDays),
      meanScore:         meanScore ? Number(meanScore) : null,
      completionRate,
      daysWatched:       Number(watchTimeDays),
    },
    anime: {
      total:      animeEntries.length,
      completed:  animeEntries.filter((e) => e.status === "COMPLETED").length,
      watching:   animeEntries.filter((e) => e.status === "WATCHING").length,
      dropped:    animeEntries.filter((e) => e.status === "DROPPED").length,
      episodes:   episodesWatched,
      meanScore:  (() => {
        const s = animeEntries.filter((e) => e.score); 
        return s.length ? Number((s.reduce((a, e) => a + (e.score ?? 0), 0) / s.length).toFixed(2)) : null;
      })(),
      statusDist:  statusDist("ANIME"),
      scoreDist:   scoreDistribution("ANIME"),
    },
    movies: {
      total:     movieEntries.length,
      completed: movieEntries.filter((e) => e.status === "COMPLETED").length,
      dropped:   movieEntries.filter((e) => e.status === "DROPPED").length,
      meanScore: (() => {
        const s = movieEntries.filter((e) => e.score);
        return s.length ? Number((s.reduce((a, e) => a + (e.score ?? 0), 0) / s.length).toFixed(2)) : null;
      })(),
      statusDist: statusDist("MOVIE"),
      scoreDist:  scoreDistribution("MOVIE"),
    },
    manga: {
      total:     mangaEntries.length,
      completed: mangaEntries.filter((e) => e.status === "COMPLETED").length,
      reading:   mangaEntries.filter((e) => e.status === "READING").length,
      dropped:   mangaEntries.filter((e) => e.status === "DROPPED").length,
      chapters:  chaptersRead,
      meanScore: (() => {
        const s = mangaEntries.filter((e) => e.score);
        return s.length ? Number((s.reduce((a, e) => a + (e.score ?? 0), 0) / s.length).toFixed(2)) : null;
      })(),
      statusDist: statusDist("MANGA"),
      scoreDist:  scoreDistribution("MANGA"),
    },
    monthlyActivity: months,
    scoreDistribution: scoreDistribution(),
  });
}
