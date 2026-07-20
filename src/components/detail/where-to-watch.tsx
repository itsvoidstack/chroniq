import Image from "next/image";
import { ExternalLink, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProviders {
  flatrate?: StreamingProvider[];
  rent?: StreamingProvider[];
  buy?: StreamingProvider[];
  link?: string;
}

interface AniListLink {
  id: number;
  url: string;
  site: string;
  type: string | null;
  language?: string | null;
  color?: string | null;
  icon?: string | null;
}

interface WhereToWatchProps {
  // TMDB providers
  providers?: WatchProviders | null;
  // AniList streaming links
  streamingLinks?: AniListLink[];
  className?: string;
}

const TMDB_IMAGE = "https://image.tmdb.org/t/p/w92";

const STREAMING_SITES = new Set([
  "Crunchyroll", "Funimation", "Netflix", "Amazon Prime Video",
  "Hulu", "Disney Plus", "HIDIVE", "VRV", "Tubi", "Apple TV Plus",
  "Max", "Peacock", "Paramount Plus",
]);

export function WhereToWatch({ providers, streamingLinks, className }: WhereToWatchProps) {
  const hasProviders =
    providers && (providers.flatrate?.length || providers.rent?.length || providers.buy?.length);

  const streamable = streamingLinks?.filter(
    (l) => l.type === "STREAMING" || STREAMING_SITES.has(l.site)
  ) ?? [];

  if (!hasProviders && streamable.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Tv className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold">Where to Watch</h2>
      </div>

      {/* AniList streaming links */}
      {streamable.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {streamable.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:border-primary/40 hover:bg-accent transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                {link.site}
                {link.language && link.language !== "Japanese" && (
                  <span className="text-[10px] text-muted-foreground">({link.language})</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* TMDB providers */}
      {hasProviders && (
        <div className="space-y-3">
          {providers!.flatrate && providers!.flatrate.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Stream</p>
              <div className="flex flex-wrap gap-2">
                {providers!.flatrate.map((p) => (
                  <a
                    key={p.provider_id}
                    href={providers!.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={p.provider_name}
                    className="relative h-10 w-10 rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-colors"
                  >
                    <Image
                      src={`${TMDB_IMAGE}${p.logo_path}`}
                      alt={p.provider_name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {providers!.rent && providers!.rent.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Rent</p>
              <div className="flex flex-wrap gap-2">
                {providers!.rent.slice(0, 6).map((p) => (
                  <a
                    key={p.provider_id}
                    href={providers!.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={p.provider_name}
                    className="relative h-10 w-10 rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-colors"
                  >
                    <Image
                      src={`${TMDB_IMAGE}${p.logo_path}`}
                      alt={p.provider_name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Streaming availability may vary by region.
      </p>
    </div>
  );
}
