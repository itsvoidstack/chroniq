"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreInputProps {
  value: number | null;
  onChange: (score: number | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ScoreInput({ value, onChange, disabled, className }: ScoreInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="group"
      aria-label="Score"
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
        <button
          key={score}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === score ? null : score)}
          onMouseEnter={() => setHovered(score)}
          onMouseLeave={() => setHovered(null)}
          aria-label={`Score ${score}`}
          aria-pressed={value === score}
          className={cn(
            "h-5 w-5 rounded-sm transition-colors disabled:cursor-not-allowed",
            display !== null && score <= display
              ? "text-yellow-400"
              : "text-muted-foreground/30 hover:text-yellow-300"
          )}
        >
          <Star
            className="h-full w-full"
            fill={display !== null && score <= display ? "currentColor" : "none"}
          />
        </button>
      ))}
      {value && (
        <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
          {value}/10
        </span>
      )}
    </div>
  );
}
