"use client";

import { MediaCard, MediaCardData, MediaCardSkeleton } from "./media-card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaGridProps {
  items: MediaCardData[];
  loading?: boolean;
  skeletonCount?: number;
  showGenres?: boolean;
  className?: string;
}

export function MediaGrid({
  items,
  loading = false,
  skeletonCount = 20,
  showGenres = false,
  className,
}: MediaGridProps) {
  const gridClass = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3";

  if (loading) {
    return (
      <div className={cn(gridClass, className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground text-sm">No results found.</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className={cn(gridClass, className)}>
      {items.map((item) => (
        <MediaCard key={`${item.type}-${item.id}`} item={item} showGenres={showGenres} />
      ))}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPage, className }: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    // Show pages around current
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="icon"
          onClick={() => onPage(p)}
          aria-label={`Page ${p}`}
          aria-current={p === page ? "page" : undefined}
          className="h-9 w-9 text-xs"
        >
          {p}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
