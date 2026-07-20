import { cn } from "@/lib/utils";

interface MetaItem {
  label: string;
  value: string | number | null | undefined;
}

interface MetaGridProps {
  items: MetaItem[];
  className?: string;
}

export function MetaGrid({ items, className }: MetaGridProps) {
  const visible = items.filter((i) => i.value != null && i.value !== "");
  if (visible.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3", className)}>
      {visible.map(({ label, value }) => (
        <div key={label}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-sm text-foreground mt-0.5 leading-snug">{value}</p>
        </div>
      ))}
    </div>
  );
}
