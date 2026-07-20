import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecommendationItem {
  id: number;
  title: string;
  cover: string | null;
  score?: number | null;
  type: string;
  year?: string | null;
  episodes?: number | null;
  chapters?: number | null;
  format?: string | null;
  status?: string | null;
}

interface RecommendationsProps {
  items: RecommendationItem[];
  className?: string;
}

export function Recommendations({ items, className }: RecommendationsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-base font-semibold">Recommendations</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {items.map((item) => {
          const href = `/${item.type}/${item.id}`;
          const score = item.score ? (item.score / 10).toFixed(1) : null;
          return (
            <Link key={item.id} href={href} className="group block">
              <div className="rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <div className="relative aspect-[2/3] bg-muted overflow-hidden">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 30vw, 14vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  {score && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5">
                      <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] font-semibold text-white">{score}</span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
