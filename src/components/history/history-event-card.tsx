"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Swords, Film, Tv, BookOpen, Chrome, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HistoryEvent {
  id: string;
  mediaType: string;
  title: string;
  coverImage: string | null;
  episodeNumber: number | null;
  chapterNumber: number | null;
  source: string;
  siteName: string | null;
  siteUrl: string | null;
  watchedAt: string | Date;
  libraryEntryId: string | null;
}

interface HistoryEventCardProps {
  event: HistoryEvent;
  onDelete?: (id: string) => void;
}

const TYPE_ICON = {
  ANIME: Swords,
  MOVIE: Film,
  TV: Tv,
  MANGA: BookOpen,
};

const TYPE_COLOR: Record<string, string> = {
  ANIME: "bg-purple-500/10 text-purple-500",
  MOVIE: "bg-blue-500/10 text-blue-500",
  TV:    "bg-green-500/10 text-green-500",
  MANGA: "bg-orange-500/10 text-orange-500",
};

const TYPE_HREF: Record<string, string> = {
  ANIME: "anime",
  MOVIE: "movie",
  TV:    "tv",
  MANGA: "manga",
};

function formatRelative(date: string | Date) {
  const d   = new Date(date);
  const now = new Date();
  const diffMs  = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH   = Math.floor(diffMin / 60);
  const diffD   = Math.floor(diffH / 24);

  if (diffMin < 1)  return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH   < 24) return `${diffH}h ago`;
  if (diffD   === 1) return "Yesterday";
  if (diffD   < 7)  return `${diffD} days ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: diffD > 365 ? "numeric" : undefined });
}

function formatFullDate(date: string | Date) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function progressLabel(event: HistoryEvent) {
  if (event.mediaType === "MANGA" && event.chapterNumber) {
    return `Chapter ${event.chapterNumber}`;
  }
  if (event.episodeNumber) {
    return event.mediaType === "MOVIE" ? "Watched" : `Episode ${event.episodeNumber}`;
  }
  return "Logged";
}

export function HistoryEventCard({ event, onDelete }: HistoryEventCardProps) {
  const Icon    = TYPE_ICON[event.mediaType as keyof typeof TYPE_ICON] ?? Film;
  const color   = TYPE_COLOR[event.mediaType] ?? "bg-muted text-muted-foreground";
  const typeSlug = TYPE_HREF[event.mediaType] ?? "anime";
  const progress = progressLabel(event);
  const relTime  = formatRelative(event.watchedAt);
  const fullTime = formatFullDate(event.watchedAt);

  async function handleDelete() {
    const res = await fetch("/api/history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id }),
    });
    if (res.ok) onDelete?.(event.id);
  }

  return (
    <div className="group flex items-start gap-3 px-4 py-3.5 hover:bg-accent/40 transition-colors border-b border-border last:border-0">
      {/* Cover */}
      <div className="shrink-0 h-12 w-9 rounded-md bg-muted overflow-hidden border border-border">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            width={36}
            height={48}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center", color)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/${typeSlug}/${event.libraryEntryId ?? "#"}`}
              className="text-sm font-medium hover:text-primary transition-colors truncate block"
            >
              {event.title}
            </Link>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {/* Type badge */}
              <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium", color)}>
                <Icon className="h-2.5 w-2.5" />
                {event.mediaType}
              </span>

              {/* Progress */}
              <span className="text-xs text-muted-foreground">{progress}</span>

              {/* Source */}
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                {event.source === "EXTENSION" ? (
                  <>
                    <Chrome className="h-2.5 w-2.5" />
                    {event.siteName ?? "Extension"}
                  </>
                ) : (
                  <>
                    <PenLine className="h-2.5 w-2.5" />
                    Manual
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Time + delete */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-xs text-muted-foreground whitespace-nowrap"
              title={fullTime}
            >
              {relTime}
            </span>
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              aria-label="Delete event"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
