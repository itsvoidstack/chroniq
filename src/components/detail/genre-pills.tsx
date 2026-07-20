import { cn } from "@/lib/utils";

interface GenrePillsProps {
  genres: string[];
  className?: string;
}

export function GenrePills({ genres, className }: GenrePillsProps) {
  if (!genres || genres.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {genres.map((g) => (
        <span
          key={g}
          className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {g}
        </span>
      ))}
    </div>
  );
}
