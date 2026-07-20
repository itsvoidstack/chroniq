// Jikan REST API client (MyAnimeList data) — server-only
import "server-only";

const JIKAN_BASE = "https://api.jikan.moe/v4";

async function jikanFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${JIKAN_BASE}${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Jikan error: ${res.status} ${endpoint}`);
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JikanMedia {
  mal_id: number;
  url: string;
  images: { jpg: { image_url: string; large_image_url: string } };
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: string | null;
  episodes: number | null;
  chapters: number | null;
  status: string;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  synopsis: string | null;
  genres: { mal_id: number; name: string }[];
  published?: { from: string | null };
  aired?: { from: string | null };
}

export interface JikanPage<T> {
  data: T[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: { count: number; total: number; per_page: number };
  };
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchMangaJikan(query: string, page = 1): Promise<JikanPage<JikanMedia>> {
  return jikanFetch("/manga", { q: query, page, limit: 20, sfw: 1 });
}

export async function searchAnimeJikan(query: string, page = 1): Promise<JikanPage<JikanMedia>> {
  return jikanFetch("/anime", { q: query, page, limit: 20, sfw: 1 });
}

// ─── Browse ───────────────────────────────────────────────────────────────────

export interface BrowseMangaParams {
  page?: number;
  genre?: number;
  status?: string;
  orderBy?: string;
  sort?: "asc" | "desc";
}

export async function browseManga(params: BrowseMangaParams = {}): Promise<JikanPage<JikanMedia>> {
  return jikanFetch("/manga", {
    page: params.page ?? 1,
    limit: 20,
    ...(params.genre && { genres: params.genre }),
    ...(params.status && { status: params.status }),
    order_by: params.orderBy ?? "popularity",
    sort: params.sort ?? "asc",
    sfw: 1,
  });
}

// ─── Top Charts ───────────────────────────────────────────────────────────────

export async function getTopMangaJikan(page = 1): Promise<JikanPage<JikanMedia>> {
  return jikanFetch("/top/manga", { page, limit: 20 });
}

export async function getTopAnimeJikan(page = 1): Promise<JikanPage<JikanMedia>> {
  return jikanFetch("/top/anime", { page, limit: 20 });
}

// ─── Genres ───────────────────────────────────────────────────────────────────

export interface JikanGenre {
  mal_id: number;
  name: string;
  count: number;
}

export async function getMangaGenres(): Promise<JikanGenre[]> {
  const data = await jikanFetch<{ data: JikanGenre[] }>("/genres/manga");
  return data.data;
}
