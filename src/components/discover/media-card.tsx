"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaCardData {
  id: number;
  title: string;
  cover: string | null;
  score?: number | null;       // 0-100 (AniList scale) or 0-100 from TMDB
  type: "anime" | "movie" | "tv" | "manga";
  episodes?: number | null;
  chapters?: number | null;
  year?: string | null;
  season?: string | null;
  seasonYear?: number | null;
  status?: string | null;
  genres?: string[];
  format?: string | null;
  studio?: string | null;
  color?: string | null;
  source?: "anilist" | "jikan";
}

interface MediaCardProps {
  item: MediaCardData;
  className?: string;
  showGenres?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  anime: "Anime",
  movie: "Movie",
  tv: "TV",
  manga: "Manga",
};

export function MediaCard({ item, className, showGenres = false }: MediaCardProps) {
  const href = `/${item.type}/${item.id}`;
  const scoreDisplay = item.score ? (item.score / 10).toFixed(1) : null;

  const sub = [
    item.format && item.format !== "TV" ? item.format : null,
    item.episodes ? `${item.episodes} eps` : null,
    item.chapters ? `${item.chapters} ch` : null,
    item.year ?? (item.seasonYear ? String(item.seasonYear) : null),
    item.season ? `${item.season[0]}${item.season.slice(1).toLowerCase()}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={href} className={cn("group block", className)}>
      <div className="relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200">
        {/* Cover image */}
        <div className="relative aspect-[2/3] bg-muted overflow-hidden">
          {item.cover ? (
            <Image
              src={item.cover}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 14vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: item.color ?? undefined }}
            >
              <span className="text-xs text-white/70 font-medium px-2 text-center leading-tight">
                {item.title}
              </span>
            </div>
          )}

          {/* Score badge */}
          {scoreDisplay && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-sm px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-semibold text-white">{scoreDisplay}</span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 right-2">
            <span className="rounded-md bg-black/70 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-medium text-white">
              {TYPE_LABEL[item.type]}
            </span>
          </div>

          {/* Status indicator */}
          {item.status === "RELEASING" && (
            <div className="absolute bottom-2 left-2">
              <span className="flex items-center gap-1 rounded-md bg-green-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Airing
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5">
          <h3 className="text-xs font-medium leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {sub && (
            <p className="text-[10px] text-muted-foreground mt-1 truncate">{sub}</p>
          )}
          {showGenres && item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.genres.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function MediaCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden animate-pulse", className)}>
      <div className="aspect-[2/3] bg-muted" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-2.5 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}
