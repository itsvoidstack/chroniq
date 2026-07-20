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
import { Recommendations } from "@/components/detail/recommendations";
import { AddToLibraryButton } from "@/components/library/add-to-library-button";

function formatDate(d: { year?: number | null; month?: number | null; day?: number | null } | null) {
  if (!d || !d.year) return null;
  const parts = [d.year, d.month?.toString().padStart(2, "0"), d.day?.toString().padStart(2, "0")].filter(Boolean);
  return parts.join("-");
}

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/media/manga/${id}`)
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
          <p className="text-muted-foreground">Could not load this manga.</p>
        </div>
      </div>
    );
  }

  const title = media.title.english ?? media.title.romaji;

  const recommendations = (media.recommendations?.nodes ?? [])
    .map((n: any) => n.mediaRecommendation)
    .filter(Boolean)
    .map((r: any) => ({
      id: r.id,
      title: r.title.english ?? r.title.romaji,
      cover: r.coverImage?.large ?? null,
      score: r.averageScore,
      type: r.type === "ANIME" ? "anime" : "manga",
      chapters: r.chapters,
    }));

  return (
    <div className="flex flex-col min-h-full">
      <Header title={title} />

      <main className="flex-1 pb-24 md:pb-8">
        <DetailBanner
          banner={media.bannerImage}
          title={title}
          color={media.coverImage?.color}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-8">
          {/* Hero row */}
          <div className="flex gap-5 sm:gap-7">
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
                mediaType="MANGA"
                anilistId={media.id}
                title={title}
                coverImage={media.coverImage?.large}
                totalCount={media.chapters}
              />
            </div>
          </div>

          <section>
            <h2 className="text-base font-semibold mb-2">Synopsis</h2>
            <Description text={media.description} />
          </section>

          <MetaGrid
            items={[
              { label: "Format", value: media.format },
              { label: "Chapters", value: media.chapters },
              { label: "Volumes", value: media.volumes },
              { label: "Status", value: media.status?.replace(/_/g, " ") },
              { label: "Start Date", value: formatDate(media.startDate) },
              { label: "End Date", value: formatDate(media.endDate) },
              { label: "Source", value: media.source?.replace(/_/g, " ") },
              { label: "Average Score", value: media.averageScore ? `${media.averageScore}/100` : null },
              { label: "Popularity", value: media.popularity?.toLocaleString() },
              { label: "Favourites", value: media.favourites?.toLocaleString() },
            ]}
          />

          <Recommendations items={recommendations} />

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
