// AniList GraphQL API client
// All calls go through Next.js Route Handlers — this file is server-only
import "server-only";

const ANILIST_URL = "https://graphql.anilist.co";

async function anilistQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 }, // 1 hour cache
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AniListMedia {
  id: number;
  title: { romaji: string; english: string | null; native: string };
  coverImage: { large: string; color: string | null };
  bannerImage: string | null;
  description: string | null;
  genres: string[];
  averageScore: number | null;
  popularity: number;
  episodes: number | null;
  chapters: number | null;
  status: string;
  season: string | null;
  seasonYear: number | null;
  startDate: { year: number | null; month: number | null; day: number | null };
  format: string | null;
  studios?: { nodes: { name: string; isAnimationStudio: boolean }[] };
  nextAiringEpisode?: { episode: number; airingAt: number } | null;
  type: "ANIME" | "MANGA";
  siteUrl: string;
}

interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AniListPage {
  pageInfo: PageInfo;
  media: AniListMedia[];
}

// ─── Fragments ────────────────────────────────────────────────────────────────

const MEDIA_FRAGMENT = `
  id
  type
  title { romaji english native }
  coverImage { large color }
  bannerImage
  description(asHtml: false)
  genres
  averageScore
  popularity
  episodes
  chapters
  status
  season
  seasonYear
  startDate { year month day }
  format
  siteUrl
  studios(isMain: true) { nodes { name isAnimationStudio } }
  nextAiringEpisode { episode airingAt }
`;

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchAnime(query: string, page = 1, perPage = 20): Promise<AniListPage> {
  const gql = `
    query SearchAnime($query: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(search: $query, type: ANIME, sort: SEARCH_MATCH) { ${MEDIA_FRAGMENT} }
      }
    }
  `;
  const data = await anilistQuery<{ Page: AniListPage }>(gql, { query, page, perPage });
  return data.Page;
}

export async function searchManga(query: string, page = 1, perPage = 20): Promise<AniListPage> {
  const gql = `
    query SearchManga($query: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(search: $query, type: MANGA, sort: SEARCH_MATCH) { ${MEDIA_FRAGMENT} }
      }
    }
  `;
  const data = await anilistQuery<{ Page: AniListPage }>(gql, { query, page, perPage });
  return data.Page;
}

// ─── Browse ───────────────────────────────────────────────────────────────────

export interface BrowseAnimeParams {
  page?: number;
  perPage?: number;
  genre?: string;
  season?: string;
  seasonYear?: number;
  status?: string;
  sort?: string[];
  type?: "ANIME" | "MANGA";
}

export async function browseMedia(params: BrowseAnimeParams): Promise<AniListPage> {
  const gql = `
    query BrowseMedia(
      $page: Int, $perPage: Int, $genre: String,
      $season: MediaSeason, $seasonYear: Int,
      $status: MediaStatus, $sort: [MediaSort], $type: MediaType
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(
          genre: $genre, season: $season, seasonYear: $seasonYear,
          status: $status, sort: $sort, type: $type
        ) { ${MEDIA_FRAGMENT} }
      }
    }
  `;
  const data = await anilistQuery<{ Page: AniListPage }>(gql, {
    page: params.page ?? 1,
    perPage: params.perPage ?? 20,
    genre: params.genre || undefined,
    season: params.season || undefined,
    seasonYear: params.seasonYear || undefined,
    status: params.status || undefined,
    sort: params.sort ?? ["POPULARITY_DESC"],
    type: params.type ?? "ANIME",
  });
  return data.Page;
}

// ─── Seasonal ─────────────────────────────────────────────────────────────────

function getCurrentSeason(): { season: string; year: number } {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  if (month >= 1 && month <= 3) return { season: "WINTER", year };
  if (month >= 4 && month <= 6) return { season: "SPRING", year };
  if (month >= 7 && month <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

export async function getSeasonalAnime(page = 1, perPage = 30): Promise<AniListPage> {
  const { season, year } = getCurrentSeason();
  return browseMedia({
    type: "ANIME",
    season,
    seasonYear: year,
    sort: ["POPULARITY_DESC"],
    page,
    perPage,
  });
}

// ─── Top Charts ───────────────────────────────────────────────────────────────

export async function getTopAnime(page = 1, perPage = 20): Promise<AniListPage> {
  return browseMedia({ type: "ANIME", sort: ["SCORE_DESC"], page, perPage });
}

export async function getTopManga(page = 1, perPage = 20): Promise<AniListPage> {
  return browseMedia({ type: "MANGA", sort: ["SCORE_DESC"], page, perPage });
}

// ─── Single media ─────────────────────────────────────────────────────────────

export async function getAnimeById(id: number): Promise<AniListMedia> {
  const gql = `
    query GetMedia($id: Int) {
      Media(id: $id) { ${MEDIA_FRAGMENT} }
    }
  `;
  const data = await anilistQuery<{ Media: AniListMedia }>(gql, { id });
  return data.Media;
}

// ─── Genres ───────────────────────────────────────────────────────────────────

export async function getGenres(): Promise<string[]> {
  const gql = `query { GenreCollection }`;
  const data = await anilistQuery<{ GenreCollection: string[] }>(gql);
  return data.GenreCollection;
}

export { getCurrentSeason };
