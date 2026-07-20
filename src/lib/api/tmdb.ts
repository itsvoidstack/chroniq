// TMDB REST API client — server-only, key never exposed to client
import "server-only";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const tmdbImage = (path: string | null, size = "w500") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_READ_ACCESS_TOKEN not set");

  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${endpoint}`);
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  media_type?: "movie";
}

export interface TMDBShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  media_type?: "tv";
}

export type TMDBResult = TMDBMovie | TMDBShow;

export interface TMDBPage<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchMovies(query: string, page = 1): Promise<TMDBPage<TMDBMovie>> {
  return tmdbFetch("/search/movie", { query, page, include_adult: false });
}

export async function searchTV(query: string, page = 1): Promise<TMDBPage<TMDBShow>> {
  return tmdbFetch("/search/tv", { query, page, include_adult: false });
}

export async function searchMulti(query: string, page = 1): Promise<TMDBPage<TMDBResult>> {
  return tmdbFetch("/search/multi", { query, page, include_adult: false });
}

// ─── Browse ───────────────────────────────────────────────────────────────────

export interface BrowseMoviesParams {
  page?: number;
  genreId?: number;
  year?: number;
  sortBy?: string;
  minVote?: number;
}

export async function browseMovies(params: BrowseMoviesParams = {}): Promise<TMDBPage<TMDBMovie>> {
  return tmdbFetch("/discover/movie", {
    page: params.page ?? 1,
    ...(params.genreId && { with_genres: params.genreId }),
    ...(params.year && { primary_release_year: params.year }),
    sort_by: params.sortBy ?? "popularity.desc",
    ...(params.minVote && { "vote_average.gte": params.minVote }),
    include_adult: false,
  });
}

export async function browseTV(params: BrowseMoviesParams = {}): Promise<TMDBPage<TMDBShow>> {
  return tmdbFetch("/discover/tv", {
    page: params.page ?? 1,
    ...(params.genreId && { with_genres: params.genreId }),
    ...(params.year && { first_air_date_year: params.year }),
    sort_by: params.sortBy ?? "popularity.desc",
    ...(params.minVote && { "vote_average.gte": params.minVote }),
    include_adult: false,
  });
}

// ─── Top Charts ───────────────────────────────────────────────────────────────

export async function getTopMovies(page = 1): Promise<TMDBPage<TMDBMovie>> {
  return tmdbFetch("/movie/top_rated", { page });
}

export async function getTrendingMovies(page = 1): Promise<TMDBPage<TMDBMovie>> {
  return tmdbFetch("/trending/movie/week", { page });
}

export async function getTrendingTV(page = 1): Promise<TMDBPage<TMDBShow>> {
  return tmdbFetch("/trending/tv/week", { page });
}

// ─── Genres ───────────────────────────────────────────────────────────────────

export async function getMovieGenres(): Promise<TMDBGenre[]> {
  const data = await tmdbFetch<{ genres: TMDBGenre[] }>("/genre/movie/list");
  return data.genres;
}

export async function getTVGenres(): Promise<TMDBGenre[]> {
  const data = await tmdbFetch<{ genres: TMDBGenre[] }>("/genre/tv/list");
  return data.genres;
}
