import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number | null; // 0–100
  voteCount?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreDisplay({ score, voteCount, className, size = "md" }: ScoreDisplayProps) {
  if (!score) return null;
  const display = (score / 10).toFixed(1);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className={cn(
          "flex items-center gap-1 font-bold",
          size === "sm" && "text-sm",
          size === "md" && "text-xl",
          size === "lg" && "text-3xl",
          score >= 75 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-muted-foreground"
        )}
      >
        <Star
          className={cn(
            "fill-current",
            size === "sm" && "h-3.5 w-3.5",
            size === "md" && "h-5 w-5",
            size === "lg" && "h-7 w-7"
          )}
        />
        {display}
      </div>
      {voteCount && (
        <span className="text-xs text-muted-foreground">
          ({voteCount.toLocaleString()} votes)
        </span>
      )}
    </div>
  );
}
