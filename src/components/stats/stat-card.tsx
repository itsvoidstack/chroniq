import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ElementType;
  accent?: string; // tailwind text color class
  className?: string;
}

export function StatCard({ label, value, sub, icon: Icon, accent, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("text-2xl font-bold mt-1.5 tabular-nums", accent ?? "text-foreground")}>
            {value}
          </p>
          {sub && (
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center bg-primary/10 shrink-0", )}>
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
