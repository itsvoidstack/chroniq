"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Loader2, ExternalLink, Play } from "lucide-react";
import { Header } from "@/components/shell/header";
import { DetailBanner } from "@/components/detail/detail-banner";
import { GenrePills } from "@/components/detail/genre-pills";
import { MetaGrid } from "@/components/detail/meta-grid";
import { ScoreDisplay } from "@/components/detail/score-display";
import { Description } from "@/components/detail/description";
import { Recommendations } from "@/components/detail/recommendations";
import { WhereToWatch } from "@/components/detail/where-to-watch";
import { CastRow } from "@/components/detail/cast-row";
import { AddToLibraryButton } from "@/components/library/add-to-library-button";
import { Button } from "@/components/ui/button";

function fmtMoney(n: number) {
  if (!n) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n);
}
function fmtRuntime(mins: number) {
  if (!mins) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/media/movie/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setMedia(data.media);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <Header />
        <div className="flex items-center justify-center flex-1 py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="flex flex-col min-h-full">
        <Header />
        <div className="flex items-center justify-center flex-1 py-32">
          <p className="text-muted-foreground">Could not load this movie.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title={media.title} />

      <main className="flex-1 pb-24 md:pb-8">
        <DetailBanner banner={media.banner} title={media.title} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-8">
          <div className="flex gap-5 sm:gap-7">
            <div className="shrink-0 w-28 sm:w-36 md:w-44 rounded-xl overflow-hidden border border-border shadow-xl">
              {media.cover ? (
                <Image src={media.cover} alt={media.title} width={176} height={264} className="w-full" priority />
              ) : (
                <div className="aspect-[2/3] bg-muted" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-20 sm:pt-24">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-1">
                {media.title}
              </h1>
              {media.originalTitle && media.originalTitle !== media.title && (
                <p className="text-sm text-muted-foreground mb-3">{media.originalTitle}</p>
              )}

              <ScoreDisplay score={media.voteAverage} voteCount={media.voteCount} size="md" className="mb-4" />

              <GenrePills genres={(media.genres ?? []).map((g: any) => g.name)} className="mb-4" />

              <div className="flex flex-wrap gap-2">
                <AddToLibraryButton
                  mediaType="MOVIE"
                  tmdbId={media.id}
                  title={media.title}
                  coverImage={media.cover}
                />
                {media.trailerKey && (
                  <Button variant="outline" asChild>
                    <a
                      href={`https://www.youtube.com/watch?v=${media.trailerKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Play className="h-4 w-4" />
                      Trailer
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-base font-semibold mb-2">Overview</h2>
            <Description text={media.overview} />
          </section>

          <MetaGrid
            items={[
              { label: "Release Date", value: media.releaseDate },
              { label: "Runtime", value: fmtRuntime(media.runtime) },
              { label: "Status", value: media.status },
              { label: "Budget", value: fmtMoney(media.budget) },
              { label: "Revenue", value: fmtMoney(media.revenue) },
              { label: "Score", value: media.voteAverage ? `${(media.voteAverage / 10).toFixed(1)}/10` : null },
              { label: "Votes", value: media.voteCount?.toLocaleString() },
              { label: "Popularity", value: media.popularity ? Math.round(media.popularity).toLocaleString() : null },
              {
                label: "Studio",
                value: media.productionCompanies?.[0]?.name ?? null,
              },
            ]}
          />

          <WhereToWatch providers={media.providers} />

          <CastRow members={media.cast ?? []} title="Cast" />

          {media.crew?.length > 0 && (
            <CastRow members={media.crew} title="Crew" />
          )}

          <Recommendations items={media.recommendations ?? []} />

          <a
            href={`https://www.themoviedb.org/movie/${media.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on TMDB
          </a>
        </div>
      </main>
    </div>
  );
}
