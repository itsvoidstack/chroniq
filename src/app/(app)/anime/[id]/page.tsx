"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Loader2, ExternalLink } from "lucide-react";
import { Header } from "@/components/shell/header";
import { DetailBanner } from "@/components/detail/detail-banner";
import { GenrePills } from "@/components/detail/genre-pills";
import { MetaGrid } from "@/components/detail/meta-grid";
import { ScoreDisplay } from "@/components/detail/score-display";
import { Description } from "@/components/detail/description";
import { EpisodeList } from "@/components/detail/episode-list";
import { Recommendations } from "@/components/detail/recommendations";
import { WhereToWatch } from "@/components/detail/where-to-watch";
import { CastRow } from "@/components/detail/cast-row";
import { AddToLibraryButton } from "@/components/library/add-to-library-button";

function formatDate(d: { year?: number | null; month?: number | null; day?: number | null } | null) {
  if (!d || !d.year) return null;
  const parts = [d.year, d.month?.toString().padStart(2, "0"), d.day?.toString().padStart(2, "0")].filter(Boolean);
  return parts.join("-");
}

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<any>(null);
  const [libraryEntry, setLibraryEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/media/anime/${id}`).then((r) => r.json()),
      fetch(`/api/library?mediaType=ANIME&anilistId=${id}`).then((r) => r.json()),
    ])
      .then(([mediaData, libData]) => {
        if (mediaData.error) { setError(mediaData.error); return; }
        setMedia(mediaData.media);
        setLibraryEntry(libData.entry ?? null);
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
          <p className="text-muted-foreground">Could not load this anime.</p>
        </div>
      </div>
    );
  }

  const title = media.title.english ?? media.title.romaji;
  const studio = media.studios?.nodes?.find((s: any) => s.isAnimationStudio);

  const streamingLinks = (media.externalLinks ?? []).filter(
    (l: any) => l.type === "STREAMING"
  );

  const recommendations = (media.recommendations?.nodes ?? [])
    .map((n: any) => n.mediaRecommendation)
    .filter(Boolean)
    .map((r: any) => ({
      id: r.id,
      title: r.title.english ?? r.title.romaji,
      cover: r.coverImage?.large ?? null,
      score: r.averageScore,
      type: r.type === "MANGA" ? "manga" : "anime",
      episodes: r.episodes,
      format: r.format,
    }));

  // Build episode list from streamingEpisodes if available.
  // AniList streamingEpisodes are often unordered and titles may contain
  // the episode number. Extract it, then sort ascending.
  const episodes = (media.streamingEpisodes ?? [])
    .map((ep: any, i: number) => {
      // Try to extract episode number from title e.g. "Episode 3 - ..." or "Ep.3"
      const match = ep.title?.match(/(?:episode|ep\.?)\s*(\d+)/i);
      const number = match ? parseInt(match[1], 10) : i + 1;
      return { number, title: ep.title, thumbnail: ep.thumbnail };
    })
    // Deduplicate by number (keep first occurrence)
    .filter((ep: any, idx: number, arr: any[]) => arr.findIndex((e) => e.number === ep.number) === idx)
    .sort((a: any, b: any) => a.number - b.number);

  return (
    <div className="flex flex-col min-h-full">
      <Header title={title} />

      <main className="flex-1 pb-24 md:pb-8">
        {/* Banner */}
        <DetailBanner
          banner={media.bannerImage}
          title={title}
          color={media.coverImage?.color}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-8">
          {/* Hero row: cover + info */}
          <div className="flex gap-5 sm:gap-7">
            {/* Cover */}
            <div className="shrink-0 w-28 sm:w-36 md:w-44 rounded-xl overflow-hidden border border-border shadow-xl">
              {media.coverImage?.extraLarge ? (
                <Image
                  src={media.coverImage.extraLarge}
                  alt={title}
                  width={176}
                  height={264}
                  className="w-full"
                  priority
                />
              ) : (
                <div className="aspect-[2/3] bg-muted" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-20 sm:pt-24">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-1">
                {title}
              </h1>
              {media.title.native && (
                <p className="text-sm text-muted-foreground mb-3">{media.title.native}</p>
              )}

              <ScoreDisplay score={media.averageScore} voteCount={media.popularity} size="md" className="mb-4" />

              <GenrePills genres={media.genres ?? []} className="mb-4" />

              <AddToLibraryButton
                mediaType="ANIME"
                anilistId={media.id}
                title={title}
                coverImage={media.coverImage?.large}
                totalCount={media.episodes}
                size="default"
              />
            </div>
          </div>

          {/* Synopsis */}
          <section>
            <h2 className="text-base font-semibold mb-2">Synopsis</h2>
            <Description text={media.description} />
          </section>

          {/* Meta info */}
          <MetaGrid
            items={[
              { label: "Format", value: media.format },
              { label: "Episodes", value: media.episodes },
              { label: "Duration", value: media.duration ? `${media.duration} min` : null },
              { label: "Status", value: media.status?.replace(/_/g, " ") },
              { label: "Season", value: media.season && media.seasonYear ? `${media.season} ${media.seasonYear}` : null },
              { label: "Start Date", value: formatDate(media.startDate) },
              { label: "End Date", value: formatDate(media.endDate) },
              { label: "Studio", value: studio?.name },
              { label: "Source", value: media.source?.replace(/_/g, " ") },
              { label: "Average Score", value: media.averageScore ? `${media.averageScore}/100` : null },
              { label: "Popularity", value: media.popularity?.toLocaleString() },
              { label: "Favourites", value: media.favourites?.toLocaleString() },
            ]}
          />

          {/* Where to watch */}
          <WhereToWatch streamingLinks={streamingLinks} />

          {/* Episode list */}
          <EpisodeList
            episodes={episodes}
            totalEpisodes={media.episodes ?? null}
            watchedProgress={libraryEntry?.progress ?? 0}
            entryId={libraryEntry?.id ?? null}
            mediaType="ANIME"
          />

          {/* Cast / Characters */}
          {media.characters?.nodes?.length > 0 && (
            <CastRow
              title="Characters"
              members={media.characters.nodes.map((c: any) => ({
                id: c.id,
                name: c.name.full,
                photo: c.image?.medium ?? null,
                role: media.characters.edges?.find((e: any) => e?.node?.id === c.id)?.role,
              }))}
            />
          )}

          {/* Recommendations */}
          <Recommendations items={recommendations} />

          {/* AniList link */}
          {media.siteUrl && (
            <a
              href={media.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on AniList
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
