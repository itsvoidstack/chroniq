import { NextRequest, NextResponse } from "next/server";
import { browseMovies, browseTV, getTrendingMovies, getTrendingTV, getTopMovies, getMovieGenres, getTVGenres, tmdbImage } from "@/lib/api/tmdb";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const mode = p.get("mode") ?? "movies"; // movies | tv | trending | top | genres
  const page = Number(p.get("page") ?? 1);
  const genreId = p.get("genre") ? Number(p.get("genre")) : undefined;
  const year = p.get("year") ? Number(p.get("year")) : undefined;
  const sortBy = p.get("sort") ?? "popularity.desc";
  const minVote = p.get("minVote") ? Number(p.get("minVote")) : undefined;

  try {
    if (mode === "genres-movie") {
      const genres = await getMovieGenres();
      return NextResponse.json({ genres });
    }
    if (mode === "genres-tv") {
      const genres = await getTVGenres();
      return NextResponse.json({ genres });
    }

    if (mode === "trending-movies") {
      const res = await getTrendingMovies(page);
      return NextResponse.json(formatMovies(res));
    }
    if (mode === "trending-tv") {
      const res = await getTrendingTV(page);
      return NextResponse.json(formatTV(res));
    }
    if (mode === "top") {
      const res = await getTopMovies(page);
      return NextResponse.json(formatMovies(res));
    }
    if (mode === "tv") {
      const res = await browseTV({ page, genreId, year, sortBy, minVote });
      return NextResponse.json(formatTV(res));
    }

    // default: movies
    const res = await browseMovies({ page, genreId, year, sortBy, minVote });
    return NextResponse.json(formatMovies(res));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function formatMovies(res: Awaited<ReturnType<typeof browseMovies>>) {
  return {
    items: res.results.map((m) => ({
      id: m.id,
      title: m.title,
      cover: tmdbImage(m.poster_path),
      banner: tmdbImage(m.backdrop_path, "w1280"),
      score: Math.round(m.vote_average * 10),
      year: m.release_date?.slice(0, 4) ?? null,
      genreIds: m.genre_ids,
      type: "movie" as const,
    })),
    page: res.page,
    totalPages: res.total_pages,
    totalResults: res.total_results,
  };
}

function formatTV(res: Awaited<ReturnType<typeof browseTV>>) {
  return {
    items: res.results.map((m) => ({
      id: m.id,
      title: m.name,
      cover: tmdbImage(m.poster_path),
      banner: tmdbImage(m.backdrop_path, "w1280"),
      score: Math.round(m.vote_average * 10),
      year: m.first_air_date?.slice(0, 4) ?? null,
      genreIds: m.genre_ids,
      type: "tv" as const,
    })),
    page: res.page,
    totalPages: res.total_pages,
    totalResults: res.total_results,
  };
}
