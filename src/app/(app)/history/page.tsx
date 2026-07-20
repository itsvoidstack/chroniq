"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/shell/header";
import {
  HistoryEventCard,
  type HistoryEvent,
} from "@/components/history/history-event-card";
import { Loader2, History, Swords, Film, Tv, BookOpen, Chrome, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Filter config ─────────────────────────────────────────────────────────

type TypeFilter   = "ALL" | "ANIME" | "MOVIE" | "TV" | "MANGA";
type SourceFilter = "ALL" | "MANUAL" | "EXTENSION";

const TYPE_FILTERS: { id: TypeFilter; label: string; icon: React.ElementType }[] = [
  { id: "ALL",   label: "All",        icon: History },
  { id: "ANIME", label: "Anime",      icon: Swords },
  { id: "MOVIE", label: "Movies",     icon: Film },
  { id: "TV",    label: "TV Shows",   icon: Tv },
  { id: "MANGA", label: "Manga",      icon: BookOpen },
];

const SOURCE_FILTERS: { id: SourceFilter; label: string; icon: React.ElementType }[] = [
  { id: "ALL",       label: "All Sources", icon: History },
  { id: "MANUAL",    label: "Manual",      icon: PenLine },
  { id: "EXTENSION", label: "Extension",   icon: Chrome },
];

// ─── Date grouping ─────────────────────────────────────────────────────────

function groupByDate(events: HistoryEvent[]): Map<string, HistoryEvent[]> {
  const map = new Map<string, HistoryEvent[]>();
  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  for (const ev of events) {
    const d = new Date(ev.watchedAt); d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === today.getTime())     label = "Today";
    else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
    else label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(ev);
  }
  return map;
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <History className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <p className="font-medium text-sm">No activity yet</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Start tracking anime, movies, or manga and your history will appear here.
      </p>
    </div>
  );
}

function NoFilterResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <p className="font-medium text-sm">No results for this filter</p>
      <button onClick={onClear} className="text-xs text-primary hover:underline mt-2">
        Clear filters
      </button>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [events, setEvents]       = useState<HistoryEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor]       = useState<string | null>(null);
  const [hasMore, setHasMore]     = useState(false);
  const [typeFilter, setTypeFilter]     = useState<TypeFilter>("ALL");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL");
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchEvents = useCallback(
    async (reset = false) => {
      const isFirstPage = reset || cursor === null;
      if (isFirstPage) setLoading(true); else setLoadingMore(true);

      const params = new URLSearchParams({ limit: "30" });
      if (typeFilter   !== "ALL") params.set("mediaType", typeFilter);
      if (sourceFilter !== "ALL") params.set("source",    sourceFilter);
      if (!isFirstPage && cursor) params.set("cursor", cursor);

      try {
        const res  = await fetch(`/api/history?${params}`);
        const data = await res.json();
        if (reset) {
          setEvents(data.events ?? []);
        } else {
          setEvents((prev) => [...prev, ...(data.events ?? [])]);
        }
        setCursor(data.nextCursor ?? null);
        setHasMore(data.hasMore ?? false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typeFilter, sourceFilter]
  );

  // Reset + refetch when filters change
  useEffect(() => {
    setCursor(null);
    setEvents([]);
    fetchEvents(true);
  }, [typeFilter, sourceFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchEvents(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, fetchEvents]);

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function clearFilters() {
    setTypeFilter("ALL");
    setSourceFilter("ALL");
  }

  const grouped = groupByDate(events);
  const totalCount = events.length;

  return (
    <div className="flex flex-col min-h-full">
      <Header title="History" />

      <main className="flex-1 pb-24 md:pb-8">
        {/* Sticky filter bar */}
        <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 space-y-2">
            {/* Type filters */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {TYPE_FILTERS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTypeFilter(id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                    typeFilter === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Source + count row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5">
                {SOURCE_FILTERS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSourceFilter(id)}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                      sourceFilter === id
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
              {!loading && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {totalCount} event{totalCount !== 1 ? "s" : ""}
                  {(typeFilter !== "ALL" || sourceFilter !== "ALL") && (
                    <button onClick={clearFilters} className="ml-2 text-primary hover:underline">
                      Clear
                    </button>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 && (typeFilter !== "ALL" || sourceFilter !== "ALL") ? (
            <NoFilterResults onClear={clearFilters} />
          ) : events.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-8">
              {Array.from(grouped.entries()).map(([dateLabel, dayEvents]) => (
                <section key={dateLabel}>
                  {/* Date heading */}
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      {dateLabel}
                    </h2>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Event cards */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {dayEvents.map((ev) => (
                      <HistoryEventCard
                        key={ev.id}
                        event={ev}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={loaderRef} className="h-4" />

              {loadingMore && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {!hasMore && events.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  You&apos;ve reached the beginning of your history.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
