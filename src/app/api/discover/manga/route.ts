import { NextRequest, NextResponse } from "next/server";
import { browseMedia, getTopManga } from "@/lib/api/anilist";
import { getTopMangaJikan } from "@/lib/api/jikan";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const mode = p.get("mode") ?? "browse"; // browse | top | top-jikan
  const page = Number(p.get("page") ?? 1);
  const genre = p.get("genre") ?? undefined;
  const status = p.get("status") ?? undefined;
  const sort = p.get("sort") ?? "POPULARITY_DESC";

  try {
    if (mode === "top-jikan") {
      const res = await getTopMangaJikan(page);
      return NextResponse.json({
        items: res.data.map((m) => ({
          id: m.mal_id,
          title: m.title_english ?? m.title,
          cover: m.images.jpg.large_image_url,
          score: m.score ? Math.round(m.score * 10) : null,
          chapters: m.chapters,
          status: m.status,
          genres: m.genres.map((g) => g.name).slice(0, 3),
          type: "manga" as const,
          source: "jikan" as const,
        })),
        pagination: res.pagination,
      });
    }

    if (mode === "top") {
      const res = await getTopManga(page, 20);
      return NextResponse.json(formatAniListManga(res));
    }

    // browse (default — AniList)
    const res = await browseMedia({
      type: "MANGA",
      genre,
      status,
      sort: [sort],
      page,
      perPage: 20,
    });
    return NextResponse.json(formatAniListManga(res));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function formatAniListManga(res: Awaited<ReturnType<typeof getTopManga>>) {
  return {
    items: res.media.map((m) => ({
      id: m.id,
      title: m.title.english ?? m.title.romaji,
      titleNative: m.title.native,
      cover: m.coverImage.large,
      color: m.coverImage.color,
      score: m.averageScore,
      chapters: m.chapters,
      status: m.status,
      genres: m.genres.slice(0, 3),
      type: "manga" as const,
      source: "anilist" as const,
    })),
    pageInfo: res.pageInfo,
  };
}
