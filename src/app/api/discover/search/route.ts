import { NextRequest, NextResponse } from "next/server";
import { searchAnime, searchManga } from "@/lib/api/anilist";
import { searchMovies, searchTV, tmdbImage } from "@/lib/api/tmdb";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ anime: [], movies: [], tv: [], manga: [] });
  }

  const [animeRes, mangaRes, moviesRes, tvRes] = await Promise.allSettled([
    searchAnime(query, 1, 6),
    searchManga(query, 1, 6),
    searchMovies(query, 1),
    searchTV(query, 1),
  ]);

  return NextResponse.json({
    anime:
      animeRes.status === "fulfilled"
        ? animeRes.value.media.slice(0, 6).map((m) => ({
            id: m.id,
            title: m.title.english ?? m.title.romaji,
            cover: m.coverImage.large,
            score: m.averageScore,
            episodes: m.episodes,
            status: m.status,
            genres: m.genres.slice(0, 2),
            type: "anime" as const,
          }))
        : [],
    manga:
      mangaRes.status === "fulfilled"
        ? mangaRes.value.media.slice(0, 6).map((m) => ({
            id: m.id,
            title: m.title.english ?? m.title.romaji,
            cover: m.coverImage.large,
            score: m.averageScore,
            chapters: m.chapters,
            status: m.status,
            genres: m.genres.slice(0, 2),
            type: "manga" as const,
          }))
        : [],
    movies:
      moviesRes.status === "fulfilled"
        ? moviesRes.value.results.slice(0, 6).map((m) => ({
            id: m.id,
            title: m.title,
            cover: tmdbImage(m.poster_path),
            score: Math.round(m.vote_average * 10),
            year: m.release_date?.slice(0, 4),
            type: "movie" as const,
          }))
        : [],
    tv:
      tvRes.status === "fulfilled"
        ? tvRes.value.results.slice(0, 6).map((m) => ({
            id: m.id,
            title: m.name,
            cover: tmdbImage(m.poster_path),
            score: Math.round(m.vote_average * 10),
            year: m.first_air_date?.slice(0, 4),
            type: "tv" as const,
          }))
        : [],
  });
}
