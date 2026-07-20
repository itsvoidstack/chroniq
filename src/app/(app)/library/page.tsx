"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/shell/header";
import { LibraryEntryRow, type LibraryEntry } from "@/components/library/library-entry-row";
import { MediaType, LibraryStatus } from "@/generated/prisma/enums";
import {
  Swords,
  Film,
  Tv,
  BookOpen,
  Library,
  Loader2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── Tab config ───────────────────────────────────────────────────────────────

interface MediaTab {
  id: MediaType;
  label: string;
  icon: React.ElementType;
  statuses: { label: string; value: LibraryStatus; emoji: string }[];
}

const MEDIA_TABS: MediaTab[] = [
  {
    id: "ANIME",
    label: "Anime",
    icon: Swords,
    statuses: [
      { label: "Watching",      value: "WATCHING",      emoji: "▶️" },
      { label: "Plan to Watch", value: "PLAN_TO_WATCH", emoji: "📋" },
      { label: "Completed",     value: "COMPLETED",     emoji: "✅" },
      { label: "On Hold",       value: "ON_HOLD",       emoji: "⏸️" },
      { label: "Dropped",       value: "DROPPED",       emoji: "🗑️" },
    ],
  },
  {
    id: "MOVIE",
    label: "Movies",
    icon: Film,
    statuses: [
      { label: "Watching",      value: "WATCHING",      emoji: "▶️" },
      { label: "Plan to Watch", value: "PLAN_TO_WATCH", emoji: "📋" },
      { label: "Completed",     value: "COMPLETED",     emoji: "✅" },
      { label: "Dropped",       value: "DROPPED",       emoji: "🗑️" },
    ],
  },
  {
    id: "TV",
    label: "TV Shows",
    icon: Tv,
    statuses: [
      { label: "Watching",      value: "WATCHING",      emoji: "▶️" },
      { label: "Plan to Watch", value: "PLAN_TO_WATCH", emoji: "📋" },
      { label: "Completed",     value: "COMPLETED",     emoji: "✅" },
      { label: "On Hold",       value: "ON_HOLD",       emoji: "⏸️" },
      { label: "Dropped",       value: "DROPPED",       emoji: "🗑️" },
    ],
  },
  {
    id: "MANGA",
    label: "Manga",
    icon: BookOpen,
    statuses: [
      { label: "Reading",      value: "READING",       emoji: "📖" },
      { label: "Plan to Read", value: "PLAN_TO_READ",  emoji: "📋" },
      { label: "Completed",    value: "COMPLETED",     emoji: "✅" },
      { label: "On Hold",      value: "ON_HOLD",       emoji: "⏸️" },
      { label: "Dropped",      value: "DROPPED",       emoji: "🗑️" },
    ],
  },
];

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ mediaType, status }: { mediaType: MediaType; status: string }) {
  const messages: Record<string, { title: string; sub: string }> = {
    WATCHING:      { title: "Nothing watching right now",    sub: "Find something to watch in Discover." },
    PLAN_TO_WATCH: { title: "Your watchlist is empty",       sub: "Add titles you want to watch later." },
    READING:       { title: "Nothing reading right now",     sub: "Find manga to read in Discover." },
    PLAN_TO_READ:  { title: "Your reading list is empty",    sub: "Add manga you want to read later." },
    COMPLETED:     { title: "No completed titles yet",       sub: "Titles you finish will show up here." },
    ON_HOLD:       { title: "Nothing on hold",               sub: "Titles you pause will appear here." },
    DROPPED:       { title: "Nothing dropped",               sub: "Hopefully that stays empty!" },
  };
  const msg = messages[status] ?? { title: "Nothing here yet", sub: "Add some titles to get started." };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Library className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <p className="font-medium text-sm">{msg.title}</p>
      <p className="text-xs text-muted-foreground mt-1 mb-5">{msg.sub}</p>
      <Button asChild size="sm">
        <Link href="/discover">Browse {mediaType === "MANGA" ? "Manga" : "Titles"}</Link>
      </Button>
    </div>
  );
}

// ─── Library list with search ─────────────────────────────────────────────────

interface LibraryListProps {
  mediaType: MediaType;
  status: LibraryStatus;
}

function LibraryList({ mediaType, status }: LibraryListProps) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEntries = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ mediaType, status });
    fetch(`/api/library?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [mediaType, status]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filtered = search.trim()
    ? entries.filter((e) =>
        e.title.toLowerCase().includes(search.trim().toLowerCase())
      )
    : entries;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return <EmptyState mediaType={mediaType} status={status} />;
  }

  return (
    <div className="space-y-3">
      {/* Search within list */}
      {entries.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${entries.length} titles...`}
            className="pl-9 h-9 text-sm"
          />
        </div>
      )}

      {/* Table header */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-4 py-2 border-b border-border bg-muted/30">
          <div className="w-10" />
          <span className="text-xs font-medium text-muted-foreground">Title</span>
          <span className="text-xs font-medium text-muted-foreground w-32 text-center">Progress</span>
          <span className="text-xs font-medium text-muted-foreground hidden lg:block w-16 text-center">Score</span>
          <span className="text-xs font-medium text-muted-foreground w-8" />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No results for &ldquo;{search}&rdquo;
          </p>
        ) : (
          filtered.map((entry) => (
            <LibraryEntryRow
              key={entry.id}
              entry={entry}
              onRemove={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
            />
          ))
        )}
      </div>

      <p className="text-xs text-muted-foreground text-right pr-1">
        {filtered.length} {filtered.length === 1 ? "title" : "titles"}
        {search && ` matching "${search}"`}
      </p>
    </div>
  );
}

// ─── Status count badge ───────────────────────────────────────────────────────

function useLibraryCounts(mediaType: MediaType) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(`/api/library?mediaType=${mediaType}`)
      .then((r) => r.json())
      .then((data) => {
        const c: Record<string, number> = {};
        (data.entries ?? []).forEach((e: LibraryEntry) => {
          c[e.status] = (c[e.status] ?? 0) + 1;
        });
        setCounts(c);
      })
      .catch(() => {});
  }, [mediaType]);

  return counts;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [activeMedia, setActiveMedia] = useState<MediaType>("ANIME");
  const [activeStatus, setActiveStatus] = useState<LibraryStatus>("WATCHING");

  const currentTab = MEDIA_TABS.find((t) => t.id === activeMedia)!;
  const counts = useLibraryCounts(activeMedia);

  // When switching media tab, reset to first status of that tab
  function switchMedia(media: MediaType) {
    setActiveMedia(media);
    const tab = MEDIA_TABS.find((t) => t.id === media)!;
    setActiveStatus(tab.statuses[0].value);
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Library" />

      <main className="flex-1 pb-24 md:pb-8">
        {/* ── Media type tab bar ── */}
        <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto scrollbar-none -mb-px">
              {MEDIA_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => switchMedia(id)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap px-5 py-3.5 border-b-2 text-sm font-medium transition-colors shrink-0",
                    activeMedia === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {/* Total count badge */}
                  {(() => {
                    const total = currentTab.id === id
                      ? Object.values(counts).reduce((a, b) => a + b, 0)
                      : null;
                    return total && total > 0 ? (
                      <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {total}
                      </span>
                    ) : null;
                  })()}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* ── Status sub-tabs ── */}
          <div className="flex flex-wrap gap-1.5">
            {currentTab.statuses.map(({ label, value }) => {
              const count = counts[value] ?? 0;
              return (
                <button
                  key={value}
                  onClick={() => setActiveStatus(value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors border",
                    activeStatus === value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                      activeStatus === value
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Entry list ── */}
          <LibraryList
            key={`${activeMedia}-${activeStatus}`}
            mediaType={activeMedia}
            status={activeStatus}
          />
        </div>
      </main>
    </div>
  );
}
