"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, X, Film, Tv, BookOpen, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResultItem {
  id: number;
  title: string;
  cover: string | null;
  score?: number | null;
  type: "anime" | "movie" | "tv" | "manga";
  year?: string | null;
  episodes?: number | null;
  chapters?: number | null;
  genres?: string[];
  status?: string | null;
}

interface SearchResults {
  anime: SearchResultItem[];
  movies: SearchResultItem[];
  tv: SearchResultItem[];
  manga: SearchResultItem[];
}

const TYPE_ICON = {
  anime: Swords,
  movie: Film,
  tv: Tv,
  manga: BookOpen,
};

const TYPE_COLOR: Record<string, string> = {
  anime: "text-purple-500",
  movie: "text-blue-500",
  tv: "text-green-500",
  manga: "text-orange-500",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface SearchBarProps {
  onResultsChange?: (results: SearchResults | null) => void;
  autoFocus?: boolean;
}

export function SearchBar({ onResultsChange, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      onResultsChange?.(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/discover/search?q=${encodeURIComponent(q)}`);
      const data: SearchResults = await res.json();
      setResults(data);
      onResultsChange?.(data);
      setOpen(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [onResultsChange]);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allResults = results
    ? [
        ...results.anime.map((r) => ({ ...r, type: "anime" as const })),
        ...results.movies.map((r) => ({ ...r, type: "movie" as const })),
        ...results.tv.map((r) => ({ ...r, type: "tv" as const })),
        ...results.manga.map((r) => ({ ...r, type: "manga" as const })),
      ]
    : [];

  const hasResults = allResults.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
          {loading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search anime, movies, TV shows, manga..."
          className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          aria-label="Search all media"
          aria-autocomplete="list"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); setOpen(false); inputRef.current?.focus(); }}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {loading && !hasResults && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          )}

          {!loading && !hasResults && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {hasResults && (
            <div className="max-h-[70vh] overflow-y-auto">
              {(["anime", "movie", "tv", "manga"] as const).map((type) => {
                const items = type === "anime" ? results?.anime :
                              type === "movie" ? results?.movies :
                              type === "tv" ? results?.tv : results?.manga;
                if (!items || items.length === 0) return null;
                const Icon = TYPE_ICON[type];
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                      <Icon className={cn("h-3.5 w-3.5", TYPE_COLOR[type])} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {type === "tv" ? "TV Shows" : type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </div>
                    <ul>
                      {items.slice(0, 5).map((item) => (
                        <li key={item.id}>
                          <Link
                            href={`/${item.type}/${item.id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors"
                          >
                            {/* Thumbnail */}
                            <div className="h-12 w-8 rounded-md bg-muted shrink-0 overflow-hidden">
                              {item.cover && (
                                <Image
                                  src={item.cover}
                                  alt={item.title}
                                  width={32}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.year && (
                                  <span className="text-xs text-muted-foreground">{item.year}</span>
                                )}
                                {item.genres && item.genres[0] && (
                                  <span className="text-xs text-muted-foreground">{item.genres[0]}</span>
                                )}
                                {item.score && (
                                  <span className="text-xs text-yellow-500 font-medium">
                                    ★ {(item.score / 10).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <div className="border-t border-border p-3 text-center">
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Browse all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
