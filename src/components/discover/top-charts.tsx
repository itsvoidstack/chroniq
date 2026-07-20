"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Star } from "lucide-react";
import { type MediaCardData } from "./media-card";
import { cn } from "@/lib/utils";

type ChartTab = "anime" | "movies" | "manga";

interface RankedItem extends MediaCardData {
  rank: number;
}

function RankBadge({ rank }: { rank: number }) {
  const gold = rank === 1 ? "bg-yellow-400 text-yellow-900" :
               rank === 2 ? "bg-zinc-300 text-zinc-800" :
               rank === 3 ? "bg-amber-600 text-amber-100" :
               "bg-muted text-muted-foreground";
  return (
    <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0", gold)}>
      {rank <= 3 ? <Trophy className="h-3 w-3" /> : rank}
    </div>
  );
}

function ChartRow({ item }: { item: RankedItem }) {
  const scoreDisplay = item.score ? (item.score / 10).toFixed(1) : null;
  const href = `/${item.type}/${item.id}`;

  return (
    <Link href={href} className="group flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-0">
      <RankBadge rank={item.rank} />

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
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.genres && item.genres[0] && (
            <span className="text-xs text-muted-foreground">{item.genres[0]}</span>
          )}
          {item.year && (
            <span className="text-xs text-muted-foreground">{item.year}</span>
          )}
          {item.episodes && (
            <span className="text-xs text-muted-foreground">{item.episodes} eps</span>
          )}
        </div>
      </div>

      {scoreDisplay && (
        <div className="flex items-center gap-1 shrink-0">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold">{scoreDisplay}</span>
        </div>
      )}
    </Link>
  );
}

function ChartSkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 animate-pulse">
      <div className="h-6 w-6 rounded-full bg-muted shrink-0" />
      <div className="h-12 w-8 rounded-md bg-muted shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

export function TopCharts() {
  const [tab, setTab] = useState<ChartTab>("anime");
  const [items, setItems] = useState<Record<ChartTab, RankedItem[]>>({ anime: [], movies: [], manga: [] });
  const [loading, setLoading] = useState<Record<ChartTab, boolean>>({ anime: true, movies: true, manga: true });

  useEffect(() => {
    // Fetch all three in parallel
    const fetchTab = (t: ChartTab) => {
      const url =
        t === "anime" ? "/api/discover/anime?mode=top&page=1" :
        t === "movies" ? "/api/discover/movies?mode=top&page=1" :
        "/api/discover/manga?mode=top&page=1";

      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          const raw: MediaCardData[] = data.items ?? [];
          setItems((prev) => ({
            ...prev,
            [t]: raw.slice(0, 50).map((item, i) => ({ ...item, rank: i + 1 })),
          }));
          setLoading((prev) => ({ ...prev, [t]: false }));
        })
        .catch(() => setLoading((prev) => ({ ...prev, [t]: false })));
    };

    fetchTab("anime");
    fetchTab("movies");
    fetchTab("manga");
  }, []);

  const tabs: { id: ChartTab; label: string }[] = [
    { id: "anime", label: "Top Anime" },
    { id: "movies", label: "Top Movies" },
    { id: "manga", label: "Top Manga" },
  ];

  const currentItems = items[tab];
  const isLoading = loading[tab];

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              tab === id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          Array.from({ length: 20 }).map((_, i) => <ChartSkeletonRow key={i} />)
        ) : currentItems.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">No data available.</p>
        ) : (
          currentItems.map((item) => <ChartRow key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
