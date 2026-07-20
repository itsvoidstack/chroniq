import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function img(path: string | null, size = "w500") {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

async function tmdb<T>(path: string): Promise<T> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN!;
  const res = await fetch(
    `${TMDB_BASE}${path}?language=en-US&append_to_response=credits,recommendations,watch/providers,videos`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const raw = await tmdb<any>(`/tv/${id}`);

    const cast = (raw.credits?.cast ?? []).slice(0, 12).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      photo: img(c.profile_path, "w185"),
    }));

    const seasons = (raw.seasons ?? [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any) => ({
        id: s.id,
        number: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        airDate: s.air_date,
        poster: img(s.poster_path, "w185"),
      }));

    const recommendations = (raw.recommendations?.results ?? []).slice(0, 8).map((r: any) => ({
      id: r.id,
      title: r.name,
      cover: img(r.poster_path),
      score: Math.round(r.vote_average * 10),
      year: r.first_air_date?.slice(0, 4) ?? null,
      type: "tv",
    }));

    const providerData = raw["watch/providers"]?.results ?? {};
    const providers = providerData["US"] ?? Object.values(providerData)[0] ?? null;

    const trailer = (raw.videos?.results ?? []).find(
      (v: any) => v.type === "Trailer" && v.site === "YouTube"
    );

    const totalEpisodes = seasons.reduce(
      (sum: number, s: { episodeCount: number }) => sum + (s.episodeCount ?? 0),
      0
    );

    return NextResponse.json({
      media: {
        id: raw.id,
        title: raw.name,
        originalTitle: raw.original_name,
        overview: raw.overview,
        cover: img(raw.poster_path, "w500"),
        banner: img(raw.backdrop_path, "original"),
        firstAirDate: raw.first_air_date,
        lastAirDate: raw.last_air_date,
        status: raw.status,
        genres: raw.genres,
        voteAverage: Math.round(raw.vote_average * 10),
        voteCount: raw.vote_count,
        numberOfSeasons: raw.number_of_seasons,
        numberOfEpisodes: raw.number_of_episodes ?? totalEpisodes,
        episodeRunTime: raw.episode_run_time?.[0] ?? null,
        networks: raw.networks?.slice(0, 3),
        seasons,
        cast,
        recommendations,
        providers,
        trailerKey: trailer?.key ?? null,
        type: "tv",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
