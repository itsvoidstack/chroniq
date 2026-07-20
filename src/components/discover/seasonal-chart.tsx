"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Radio, ChevronDown } from "lucide-react";
import { MediaCardData, MediaCardSkeleton } from "./media-card";
import { cn } from "@/lib/utils";

const FORMAT_LABEL: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  ONA: "ONA",
  OVA: "OVA",
  SPECIAL: "Special",
  MUSIC: "Music",
};

interface SeasonalItem extends MediaCardData {
  studio?: string | null;
  nextEpisode?: { episode: number; airingAt: number } | null;
  format?: string | null;
  banner?: string | null;
  color?: string | null;
}

function SeasonalCard({ item }: { item: SeasonalItem }) {
  const scoreDisplay = item.score ? (item.score / 10).toFixed(1) : null;
  const nextAir = item.nextEpisode
    ? new Date(item.nextEpisode.airingAt * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link href={`/anime/${item.id}`} className="group">
      <div className="rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden flex gap-0">
        {/* Cover */}
        <div className="relative w-16 shrink-0">
          <div className="h-full aspect-[2/3] bg-muted overflow-hidden">
            {item.cover ? (
              <Image
                src={item.cover}
                alt={item.title}
                fill
                sizes="64px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ backgroundColor: item.color ?? undefined }}
              />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            {scoreDisplay && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold">{scoreDisplay}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {item.format && (
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {FORMAT_LABEL[item.format] ?? item.format}
              </span>
            )}
            {item.studio && (
              <span className="text-[10px] text-muted-foreground truncate">{item.studio}</span>
            )}
          </div>

          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.genres.slice(0, 2).map((g) => (
                <span key={g} className="rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[10px]">
                  {g}
                </span>
              ))}
            </div>
          )}

          {nextAir && (
            <div className="flex items-center gap-1 mt-2">
              <Radio className="h-3 w-3 text-green-500" />
              <span className="text-[10px] text-muted-foreground">
                Ep {item.nextEpisode!.episode} · {nextAir}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function SeasonalChart() {
  const [items, setItems] = useState<SeasonalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/discover/anime?mode=seasonal&page=${page}&perPage=30`)
      .then((r) => r.json())
      .then((data) => {
        if (page === 1) {
          setItems(data.items ?? []);
        } else {
          setItems((prev) => [...prev, ...(data.items ?? [])]);
        }
        setHasMore(data.pageInfo?.hasNextPage ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  const formats = ["ALL", "TV", "MOVIE", "ONA", "OVA", "SPECIAL"];
  const filtered =
    filter === "ALL" ? items : items.filter((i) => i.format === filter);

  const season = ["WINTER","SPRING","SUMMER","FALL"][[1,4,7,10].findIndex(
    (m, i, a) => new Date().getMonth() + 1 >= m && (i === a.length - 1 || new Date().getMonth() + 1 < a[i + 1])
  )];
  const year = new Date().getFullYear();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-muted-foreground">
            {season} {year}
          </span>
          <span className="rounded-full bg-green-500/10 text-green-600 text-[10px] px-2 py-0.5 font-medium">
            Currently Airing
          </span>
        </div>
      </div>

      {/* Format filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {formats.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <MediaCardSkeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <SeasonalCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="text-center pt-2">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
          >
            <ChevronDown className="h-4 w-4" />
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
