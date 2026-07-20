import { cn } from "@/lib/utils";
import { LibraryStatus } from "@/generated/prisma/enums";

const STATUS_CONFIG: Record<
  LibraryStatus,
  { label: string; className: string }
> = {
  WATCHING:       { label: "Watching",       className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  PLAN_TO_WATCH:  { label: "Plan to Watch",  className: "bg-muted text-muted-foreground" },
  COMPLETED:      { label: "Completed",      className: "bg-green-500/10 text-green-600 dark:text-green-400" },
  ON_HOLD:        { label: "On Hold",        className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  DROPPED:        { label: "Dropped",        className: "bg-red-500/10 text-red-600 dark:text-red-400" },
  READING:        { label: "Reading",        className: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  PLAN_TO_READ:   { label: "Plan to Read",   className: "bg-muted text-muted-foreground" },
};

interface StatusBadgeProps {
  status: LibraryStatus;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
