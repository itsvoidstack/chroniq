"use client";

import { useState, useEffect } from "react";
import { MediaGrid, Pagination } from "./media-grid";
import { FilterBar, FilterSelect } from "./filter-bar";
import { MediaCardData } from "./media-card";

const SORT_MOVIES = [
  { label: "Popularity", value: "popularity.desc" },
  { label: "Top Rated", value: "vote_average.desc" },
  { label: "Newest", value: "release_date.desc" },
  { label: "Revenue", value: "revenue.desc" },
];

const SORT_TV = [
  { label: "Popularity", value: "popularity.desc" },
  { label: "Top Rated", value: "vote_average.desc" },
  { label: "Newest", value: "first_air_date.desc" },
];

const currentYear = new Date().getFullYear();
const YEARS = [
  { label: "Any Year", value: "" },
  ...Array.from({ length: 30 }, (_, i) => {
    const y = currentYear - i;
    return { label: String(y), value: String(y) };
  }),
];

interface Genre { id: number; name: string }

type SubTab = "movies" | "tv";

export function BrowseMovies() {
  const [subTab, setSubTab] = useState<SubTab>("movies");
  const [items, setItems] = useState<MediaCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("popularity.desc");

  // Load genres when subTab changes
  useEffect(() => {
    fetch(`/api/discover/genres?type=${subTab === "movies" ? "movie" : "tv"}`)
      .then((r) => r.json())
      .then((d) => setGenres(d.genres ?? []));
  }, [subTab]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({
      mode: subTab,
      page: String(page),
      sort,
    });
    if (genre) params.set("genre", genre);
    if (year) params.set("year", year);

    fetch(`/api/discover/movies?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setTotalPages(Math.min(data.totalPages ?? 1, 50));
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => controller.abort();
  }, [page, subTab, genre, year, sort]);

  function handleFilter() { setPage(1); }
  function switchTab(t: SubTab) {
    setSubTab(t);
    setGenre("");
    setSort("popularity.desc");
    setPage(1);
  }

  const sortOptions = subTab === "movies" ? SORT_MOVIES : SORT_TV;

  return (
    <div className="space-y-5">
      {/* Movies / TV sub-tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {(["movies", "tv"] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              subTab === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "movies" ? "Movies" : "TV Shows"}
          </button>
        ))}
      </div>

      <FilterBar>
        <FilterSelect
          label="Genre"
          value={genre}
          onChange={(v) => { setGenre(v); handleFilter(); }}
          options={[
            { label: "All Genres", value: "" },
            ...genres.map((g) => ({ label: g.name, value: String(g.id) })),
          ]}
          className="w-40"
        />
        <FilterSelect
          label="Year"
          value={year}
          onChange={(v) => { setYear(v); handleFilter(); }}
          options={YEARS}
          className="w-28"
        />
        <FilterSelect
          label="Sort by"
          value={sort}
          onChange={(v) => { setSort(v); handleFilter(); }}
          options={sortOptions}
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
