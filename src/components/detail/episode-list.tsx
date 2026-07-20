"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProgress } from "@/app/actions/library";

interface Episode {
  number: number;
  title?: string;
  thumbnail?: string | null;
  airDate?: string | null;
}

interface EpisodeListProps {
  episodes: Episode[];
  totalEpisodes: number | null;
  watchedProgress: number;
  entryId: string | null;
  mediaType?: string;
  className?: string;
}

const PAGE_SIZE = 24;

export function EpisodeList({
  episodes,
  totalEpisodes,
  watchedProgress,
  entryId,
  className,
}: EpisodeListProps) {
  const count = totalEpisodes ?? episodes.length;

  // Build a sorted episode list — always ascending by episode number
  const sortedEps: Episode[] = (
    episodes.length > 0
      ? [...episodes].sort((a, b) => a.number - b.number)
      : Array.from({ length: count }, (_, i) => ({ number: i + 1 }))
  );

  // Watched state: a Set of individually watched episode numbers.
  // Initialise from progress: episodes 1..watchedProgress are all watched.
  const [watchedSet, setWatchedSet] = useState<Set<number>>(
    () => new Set(Array.from({ length: watchedProgress }, (_, i) => i + 1))
  );
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const pageEps = sortedEps.slice(0, page * PAGE_SIZE);
  const hasMore = pageEps.length < sortedEps.length;

  // Highest consecutive episode watched (for progress tracking)
  function highestConsecutive(set: Set<number>): number {
    let n = 0;
    while (set.has(n + 1)) n++;
    return n;
  }

  function handleToggle(epNum: number) {
    if (!entryId) return;

    setWatchedSet((prev) => {
      const next = new Set(prev);
      if (next.has(epNum)) {
        // Unwatch: remove this episode and all above it
        // (can't have ep 5 watched without ep 4)
        for (const n of Array.from(next)) {
          if (n >= epNum) next.delete(n);
        }
      } else {
        // Watch: add this episode and all below it
        for (let i = 1; i <= epNum; i++) next.add(i);
      }

      const newProgress = highestConsecutive(next);
      startTransition(async () => {
        await updateProgress(entryId, newProgress);
      });

      return next;
    });
  }

  if (count === 0) return null;

  const watchedCount = watchedSet.size;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Episodes
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {count} total
          </span>
        </h2>
        {entryId && (
          <span className="text-xs text-muted-foreground">
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin inline" />
            ) : (
              `${watchedCount}/${count} watched`
            )}
          </span>
        )}
      </div>

      {/* Episode grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pageEps.map((ep) => {
          const isWatched = watchedSet.has(ep.number);
          return (
            <button
              key={ep.number}
              onClick={() => handleToggle(ep.number)}
              disabled={!entryId || isPending}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                isWatched
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent/50",
                !entryId && "cursor-default"
              )}
            >
              {/* Episode number / check circle */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isWatched
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isWatched ? <Check className="h-4 w-4" /> : ep.number}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    isWatched && "text-muted-foreground line-through"
                  )}
                >
                  {ep.title ?? `Episode ${ep.number}`}
                </p>
                {ep.airDate && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(ep.airDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>

              {!isWatched && entryId && (
                <Play className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {!entryId && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Add to library to track episodes
        </p>
      )}

      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mx-auto"
        >
          <ChevronDown className="h-4 w-4" />
          Show more episodes
        </button>
      )}
    </div>
  );
}
