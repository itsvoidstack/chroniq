"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Trash2, BookmarkCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { ProgressControl } from "./progress-control";
import { ScoreInput } from "./score-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  updateStatus,
  updateScore,
  removeFromLibrary,
} from "@/app/actions/library";
import { LibraryStatus, MediaType } from "@/generated/prisma/enums";

export interface LibraryEntry {
  id: string;
  title: string;
  coverImage: string | null;
  mediaType: MediaType;
  status: LibraryStatus;
  progress: number;
  totalCount: number | null;
  score: number | null;
  anilistId: number | null;
  tmdbId: number | null;
  updatedAt: Date | string;
}

// Status options per media type
const ANIME_STATUSES: { label: string; value: LibraryStatus }[] = [
  { label: "Watching",      value: "WATCHING" },
  { label: "Plan to Watch", value: "PLAN_TO_WATCH" },
  { label: "Completed",     value: "COMPLETED" },
  { label: "On Hold",       value: "ON_HOLD" },
  { label: "Dropped",       value: "DROPPED" },
];
const MANGA_STATUSES: { label: string; value: LibraryStatus }[] = [
  { label: "Reading",       value: "READING" },
  { label: "Plan to Read",  value: "PLAN_TO_READ" },
  { label: "Completed",     value: "COMPLETED" },
  { label: "On Hold",       value: "ON_HOLD" },
  { label: "Dropped",       value: "DROPPED" },
];

function getHref(entry: LibraryEntry) {
  if (entry.mediaType === "ANIME" && entry.anilistId) return `/anime/${entry.anilistId}`;
  if (entry.mediaType === "MANGA" && entry.anilistId) return `/manga/${entry.anilistId}`;
  if ((entry.mediaType === "MOVIE" || entry.mediaType === "TV") && entry.tmdbId)
    return `/${entry.mediaType.toLowerCase()}/${entry.tmdbId}`;
  return "#";
}

interface LibraryEntryRowProps {
  entry: LibraryEntry;
  onRemove?: (id: string) => void;
}

export function LibraryEntryRow({ entry, onRemove }: LibraryEntryRowProps) {
  const [currentStatus, setCurrentStatus] = useState<LibraryStatus>(entry.status);
  const [currentScore, setCurrentScore] = useState<number | null>(entry.score);
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isManga = entry.mediaType === "MANGA";
  const statusOptions = isManga ? MANGA_STATUSES : ANIME_STATUSES;
  const href = getHref(entry);

  function handleStatusChange(status: LibraryStatus) {
    setCurrentStatus(status);
    startTransition(async () => {
      await updateStatus(entry.id, status);
    });
  }

  function handleScoreChange(score: number | null) {
    setCurrentScore(score);
    startTransition(async () => {
      await updateScore(entry.id, score);
    });
  }

  function handleRemove() {
    setRemoved(true);
    startTransition(async () => {
      await removeFromLibrary(entry.id);
      onRemove?.(entry.id);
    });
  }

  if (removed) return null;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/40 transition-colors",
        isPending && "opacity-60"
      )}
    >
      {/* Cover */}
      <Link href={href} className="shrink-0">
        <div className="h-14 w-10 rounded-md bg-muted overflow-hidden border border-border">
          {entry.coverImage ? (
            <Image
              src={entry.coverImage}
              alt={entry.title}
              width={40}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
        </div>
      </Link>

      {/* Title + status */}
      <div className="flex-1 min-w-0">
        <Link href={href}>
          <p className="text-sm font-medium truncate hover:text-primary transition-colors">
            {entry.title}
          </p>
        </Link>
        <div className="mt-1">
          <StatusBadge status={currentStatus} />
        </div>
      </div>

      {/* Progress */}
      <div className="hidden sm:block shrink-0">
        <ProgressControl
          entryId={entry.id}
          progress={entry.progress}
          total={entry.totalCount}
          mediaType={entry.mediaType}
        />
      </div>

      {/* Score — hidden on small screens */}
      <div className="hidden lg:flex shrink-0 items-center gap-1">
        {currentScore ? (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold tabular-nums">{currentScore}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* More actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          {statusOptions.map(({ label, value }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => handleStatusChange(value)}
              className={cn(currentStatus === value && "text-primary font-medium")}
            >
              <BookmarkCheck className={cn("h-4 w-4", currentStatus === value ? "text-primary" : "text-muted-foreground")} />
              {label}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Score</DropdownMenuLabel>
          <div className="px-2 py-1.5">
            <ScoreInput
              value={currentScore}
              onChange={handleScoreChange}
              disabled={isPending}
            />
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleRemove}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Remove from library
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
