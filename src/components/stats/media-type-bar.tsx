"use client";

import { cn } from "@/lib/utils";

interface MediaTypeBarProps {
  anime:  number;
  movies: number;
  tv:     number;
  manga:  number;
  className?: string;
}

const SEGMENTS = [
  { key: "anime",  label: "Anime",    color: "bg-purple-500" },
  { key: "movies", label: "Movies",   color: "bg-blue-500"   },
  { key: "tv",     label: "TV",       color: "bg-green-500"  },
  { key: "manga",  label: "Manga",    color: "bg-orange-500" },
] as const;

export function MediaTypeBar({ anime, movies, tv, manga, className }: MediaTypeBarProps) {
  const total = anime + movies + tv + manga;
  if (total === 0) return null;

  const values = { anime, movies, tv, manga };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <h3 className="text-sm font-semibold mb-4">Media Distribution</h3>

      {/* Stacked bar */}
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-4">
        {SEGMENTS.map(({ key, color }) => {
          const pct = Math.round((values[key] / total) * 100);
          if (pct === 0) return null;
          return (
            <div
              key={key}
              className={cn("h-full transition-all", color)}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SEGMENTS.map(({ key, label, color }) => {
          const count = values[key];
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", color)} />
              <div>
                <p className="text-xs font-medium">{label}</p>
                <p className="text-[11px] text-muted-foreground">{count} ({pct}%)</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
