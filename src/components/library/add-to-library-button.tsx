"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Check, ChevronDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { addToLibrary, updateStatus, removeFromLibrary } from "@/app/actions/library";
import { LibraryStatus, MediaType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const ANIME_STATUSES: { label: string; value: LibraryStatus }[] = [
  { label: "Watching",      value: "WATCHING" },
  { label: "Plan to Watch", value: "PLAN_TO_WATCH" },
  { label: "Completed",     value: "COMPLETED" },
  { label: "On Hold",       value: "ON_HOLD" },
  { label: "Dropped",       value: "DROPPED" },
];
const MANGA_STATUSES: { label: string; value: LibraryStatus }[] = [
  { label: "Reading",      value: "READING" },
  { label: "Plan to Read", value: "PLAN_TO_READ" },
  { label: "Completed",    value: "COMPLETED" },
  { label: "On Hold",      value: "ON_HOLD" },
  { label: "Dropped",      value: "DROPPED" },
];

interface AddToLibraryButtonProps {
  mediaType: MediaType;
  anilistId?: number;
  tmdbId?: number;
  title: string;
  coverImage?: string | null;
  totalCount?: number | null;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function AddToLibraryButton({
  mediaType,
  anilistId,
  tmdbId,
  title,
  coverImage,
  totalCount,
  className,
  size = "default",
}: AddToLibraryButtonProps) {
  const [entryId, setEntryId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<LibraryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const statusOptions = mediaType === "MANGA" ? MANGA_STATUSES : ANIME_STATUSES;
  const isInLibrary = entryId !== null;

  // Check if already in library on mount
  useEffect(() => {
    const params = new URLSearchParams();
    if (mediaType) params.set("mediaType", mediaType);
    if (anilistId) params.set("anilistId", String(anilistId));
    if (tmdbId) params.set("tmdbId", String(tmdbId));

    fetch(`/api/library?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.entry) {
          setEntryId(data.entry.id);
          setCurrentStatus(data.entry.status);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [mediaType, anilistId, tmdbId]);

  function handleAdd(status: LibraryStatus) {
    startTransition(async () => {
      const result = await addToLibrary({
        mediaType,
        anilistId,
        tmdbId,
        title,
        coverImage: coverImage ?? undefined,
        totalCount: totalCount ?? undefined,
        status,
      });
      if (result.success) {
        setEntryId(result.entry.id);
        setCurrentStatus(status);
      }
    });
  }

  function handleStatusChange(status: LibraryStatus) {
    if (!entryId) return;
    setCurrentStatus(status);
    startTransition(async () => {
      await updateStatus(entryId, status);
    });
  }

  function handleRemove() {
    if (!entryId) return;
    startTransition(async () => {
      await removeFromLibrary(entryId);
      setEntryId(null);
      setCurrentStatus(null);
    });
  }

  if (loading) {
    return (
      <Button size={size} variant="outline" disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  // Not in library — show Add button with status picker
  if (!isInLibrary) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={size} className={className} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add to Library
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Add as...</DropdownMenuLabel>
          {statusOptions.map(({ label, value }) => (
            <DropdownMenuItem key={value} onClick={() => handleAdd(value)}>
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // In library — show current status with change/remove options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant="outline"
          className={cn("border-primary/40 text-primary hover:bg-primary/5", className)}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {currentStatus && (
            <StatusBadge status={currentStatus} className="ml-1 bg-transparent px-0 text-inherit" />
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-70 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
        {statusOptions.map(({ label, value }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleStatusChange(value)}
            className={cn(currentStatus === value && "text-primary font-medium")}
          >
            <Check className={cn("h-4 w-4", currentStatus === value ? "opacity-100" : "opacity-0")} />
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleRemove}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          Remove from Library
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
