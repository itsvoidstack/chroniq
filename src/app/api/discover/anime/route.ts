import { NextRequest, NextResponse } from "next/server";
import { browseMedia, getSeasonalAnime, getTopAnime } from "@/lib/api/anilist";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const mode = p.get("mode") ?? "browse"; // browse | seasonal | top
  const page = Number(p.get("page") ?? 1);
  const genre = p.get("genre") ?? undefined;
  const season = p.get("season") ?? undefined;
  const seasonYear = p.get("year") ? Number(p.get("year")) : undefined;
  const status = p.get("status") ?? undefined;
  const sort = p.get("sort") ?? "POPULARITY_DESC";

  try {
    let result;
    if (mode === "seasonal") {
      result = await getSeasonalAnime(page, 30);
    } else if (mode === "top") {
      result = await getTopAnime(page, 20);
    } else {
      result = await browseMedia({
        type: "ANIME",
        genre,
        season,
        seasonYear,
        status,
        sort: [sort],
        page,
        perPage: 20,
      });
    }

    return NextResponse.json({
      items: result.media.map((m) => ({
        id: m.id,
        title: m.title.english ?? m.title.romaji,
        titleNative: m.title.native,
        cover: m.coverImage.large,
        color: m.coverImage.color,
        banner: m.bannerImage,
        score: m.averageScore,
        episodes: m.episodes,
        status: m.status,
        season: m.season,
        seasonYear: m.seasonYear,
        genres: m.genres.slice(0, 3),
        format: m.format,
        studio: m.studios?.nodes.find((s) => s.isAnimationStudio)?.name ?? null,
        nextEpisode: m.nextAiringEpisode ?? null,
        type: "anime" as const,
        siteUrl: m.siteUrl,
      })),
      pageInfo: result.pageInfo,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
