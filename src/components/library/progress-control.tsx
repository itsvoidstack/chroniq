"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProgress } from "@/app/actions/library";

interface ProgressControlProps {
  entryId: string;
  progress: number;
  total: number | null;
  mediaType: string;
  className?: string;
  onUpdate?: (newProgress: number) => void;
}

export function ProgressControl({
  entryId,
  progress,
  total,
  mediaType,
  className,
  onUpdate,
}: ProgressControlProps) {
  const [current, setCurrent] = useState(progress);
  const [isPending, startTransition] = useTransition();
  const unit = mediaType === "MANGA" ? "Ch." : "Ep.";

  async function handleChange(newVal: number) {
    if (newVal < 0) return;
    if (total !== null && newVal > total) return;
    setCurrent(newVal);
    onUpdate?.(newVal);
    startTransition(async () => {
      await updateProgress(entryId, newVal);
    });
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <button
        onClick={() => handleChange(current - 1)}
        disabled={current <= 0 || isPending}
        className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease progress"
      >
        <Minus className="h-3 w-3" />
      </button>

      <span className="text-xs font-medium tabular-nums min-w-[4rem] text-center">
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin mx-auto" />
        ) : (
          <>
            {unit} {current}
            {total !== null && (
              <span className="text-muted-foreground">/{total}</span>
            )}
          </>
        )}
      </span>

      <button
        onClick={() => handleChange(current + 1)}
        disabled={(total !== null && current >= total) || isPending}
        className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase progress"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
