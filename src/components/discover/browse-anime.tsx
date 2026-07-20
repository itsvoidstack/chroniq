"use client";

import { useState, useEffect } from "react";
import { MediaGrid, Pagination } from "./media-grid";
import { FilterBar, FilterSelect } from "./filter-bar";
import { MediaCardData } from "./media-card";

const GENRES = [
  "Action","Adventure","Comedy","Drama","Ecchi","Fantasy","Horror",
  "Mahou Shoujo","Mecha","Music","Mystery","Psychological","Romance",
  "Sci-Fi","Slice of Life","Sports","Supernatural","Thriller",
];

const SEASONS = [
  { label: "Any Season", value: "" },
  { label: "Winter", value: "WINTER" },
  { label: "Spring", value: "SPRING" },
  { label: "Summer", value: "SUMMER" },
  { label: "Fall", value: "FALL" },
];

const STATUSES = [
  { label: "Any Status", value: "" },
  { label: "Airing", value: "RELEASING" },
  { label: "Finished", value: "FINISHED" },
  { label: "Not Yet Aired", value: "NOT_YET_RELEASED" },
];

const SORTS = [
  { label: "Popularity", value: "POPULARITY_DESC" },
  { label: "Top Rated", value: "SCORE_DESC" },
  { label: "Trending", value: "TRENDING_DESC" },
  { label: "Newest", value: "START_DATE_DESC" },
  { label: "Title A–Z", value: "TITLE_ROMAJI" },
];

const currentYear = new Date().getFullYear();
const YEARS = [
  { label: "Any Year", value: "" },
  ...Array.from({ length: 30 }, (_, i) => {
    const y = currentYear - i;
    return { label: String(y), value: String(y) };
  }),
];

export function BrowseAnime() {
  const [items, setItems] = useState<MediaCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genre, setGenre] = useState("");
  const [season, setSeason] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("POPULARITY_DESC");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ mode: "browse", page: String(page), sort });
    if (genre) params.set("genre", genre);
    if (season) params.set("season", season);
    if (year) params.set("year", year);
    if (status) params.set("status", status);

    fetch(`/api/discover/anime?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setTotalPages(Math.min(data.pageInfo?.lastPage ?? 1, 50));
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => controller.abort();
  }, [page, genre, season, year, status, sort]);

  function handleFilter() {
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <FilterBar>
        <FilterSelect
          label="Genre"
          value={genre}
          onChange={(v) => { setGenre(v); handleFilter(); }}
          options={[
            { label: "All Genres", value: "" },
            ...GENRES.map((g) => ({ label: g, value: g })),
          ]}
          className="w-36"
        />
        <FilterSelect
          label="Season"
          value={season}
          onChange={(v) => { setSeason(v); handleFilter(); }}
          options={SEASONS}
          className="w-32"
        />
        <FilterSelect
          label="Year"
          value={year}
          onChange={(v) => { setYear(v); handleFilter(); }}
          options={YEARS}
          className="w-28"
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(v) => { setStatus(v); handleFilter(); }}
          options={STATUSES}
          className="w-36"
        />
        <FilterSelect
          label="Sort by"
          value={sort}
          onChange={(v) => { setSort(v); handleFilter(); }}
          options={SORTS}
          className="w-36"
        />
      </FilterBar>

      <MediaGrid items={items} loading={loading} skeletonCount={20} />

      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="pt-4"
        />
      )}
    </div>
  );
}
