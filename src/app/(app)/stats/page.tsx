"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/shell/header";
import { StatCard } from "@/components/stats/stat-card";
import { ActivityChart } from "@/components/stats/activity-chart";
import { ScoreDistribution } from "@/components/stats/score-distribution";
import { StatusDonut } from "@/components/stats/status-donut";
import { MediaTypeBar } from "@/components/stats/media-type-bar";
import {
  Tv, Film, BookOpen, Clock, Star, CheckCircle2,
  TrendingUp, Loader2, Swords, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatsData {
  overview: {
    totalEntries: number;
    episodesWatched: number;
    moviesWatched: number;
    chaptersRead: number;
    watchTimeDays: number;
    meanScore: number | null;
    completionRate: number;
    daysWatched: number;
  };
  anime: {
    total: number; completed: number; watching: number; dropped: number;
    episodes: number; meanScore: number | null;
    statusDist: { status: string; count: number }[];
    scoreDist: { score: number; count: number }[];
  };
  movies: {
    total: number; completed: number; dropped: number;
    meanScore: number | null;
    statusDist: { status: string; count: number }[];
    scoreDist: { score: number; count: number }[];
  };
  manga: {
    total: number; completed: number; reading: number; dropped: number;
    chapters: number; meanScore: number | null;
    statusDist: { status: string; count: number }[];
    scoreDist: { score: number; count: number }[];
  };
  monthlyActivity: { label: string; episodes: number; chapters: number; movies: number }[];
  scoreDistribution: { score: number; count: number }[];
}

// ─── Tab config ──────────────────────────────────────────────────────────────

type Tab = "overview" | "anime" | "movies" | "manga";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "anime",    label: "Anime",    icon: Swords },
  { id: "movies",   label: "Movies & TV", icon: Film },
  { id: "manga",    label: "Manga",    icon: BookOpen },
];

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyStats() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <BarChart3 className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <p className="font-medium text-sm">No stats yet</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Add titles to your library and start tracking to see your statistics here.
      </p>
      <Link href="/discover" className="text-xs text-primary hover:underline mt-3 font-medium">
        Discover titles →
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [stats, setStats]   = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState<Tab>("overview");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Stats" />

      <main className="flex-1 pb-24 md:pb-8">
        {/* Tab bar */}
        <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto scrollbar-none -mb-px">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap px-4 py-3.5 border-b-2 text-sm font-medium transition-colors shrink-0",
                    tab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : !stats || stats.overview.totalEntries === 0 ? (
            <EmptyStats />
          ) : (
            <>
              {/* ── Overview tab ── */}
              {tab === "overview" && (
                <div className="space-y-6">
                  {/* Top stat cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Days Watched"
                      value={stats.overview.daysWatched}
                      sub="Total watch time"
                      icon={Clock}
                      accent="text-primary"
                    />
                    <StatCard
                      label="Episodes"
                      value={stats.overview.episodesWatched.toLocaleString()}
                      sub="Anime + TV"
                      icon={Tv}
                    />
                    <StatCard
                      label="Movies"
                      value={stats.overview.moviesWatched.toLocaleString()}
                      sub="Completed"
                      icon={Film}
                    />
                    <StatCard
                      label="Chapters"
                      value={stats.overview.chaptersRead.toLocaleString()}
                      sub="Manga read"
                      icon={BookOpen}
                    />
                    <StatCard
                      label="Mean Score"
                      value={stats.overview.meanScore ? `${stats.overview.meanScore}/10` : "—"}
                      sub="Across all media"
                      icon={Star}
                      accent={stats.overview.meanScore ? "text-yellow-500" : undefined}
                    />
                    <StatCard
                      label="Completion Rate"
                      value={`${stats.overview.completionRate}%`}
                      sub="Titles completed"
                      icon={CheckCircle2}
                      accent="text-green-500"
                    />
                    <StatCard
                      label="Total Entries"
                      value={stats.overview.totalEntries.toLocaleString()}
                      sub="In your library"
                      icon={TrendingUp}
                    />
                  </div>

                  {/* Media distribution */}
                  <MediaTypeBar
                    anime={stats.anime.total}
                    movies={stats.movies.total}
                    tv={0}
                    manga={stats.manga.total}
                  />

                  {/* Monthly activity line chart */}
                  <ActivityChart data={stats.monthlyActivity} />

                  {/* Overall score distribution */}
                  <ScoreDistribution data={stats.scoreDistribution} title="Score Distribution — All Media" />
                </div>
              )}

              {/* ── Anime tab ── */}
              {tab === "anime" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Anime"  value={stats.anime.total}     icon={Swords} accent="text-purple-500" />
                    <StatCard label="Completed"    value={stats.anime.completed}  icon={CheckCircle2} accent="text-green-500" />
                    <StatCard label="Watching"     value={stats.anime.watching}   icon={Tv} />
                    <StatCard label="Episodes"     value={stats.anime.episodes.toLocaleString()} icon={TrendingUp} />
                    <StatCard
                      label="Mean Score"
                      value={stats.anime.meanScore ? `${stats.anime.meanScore}/10` : "—"}
                      icon={Star}
                      accent={stats.anime.meanScore ? "text-yellow-500" : undefined}
                    />
                    <StatCard label="Dropped"      value={stats.anime.dropped}    icon={TrendingUp} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <StatusDonut data={stats.anime.statusDist} title="Status Breakdown" />
                    <ScoreDistribution data={stats.anime.scoreDist} title="Your Anime Scores" />
                  </div>
                </div>
              )}

              {/* ── Movies tab ── */}
              {tab === "movies" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Movies" value={stats.movies.total}     icon={Film} accent="text-blue-500" />
                    <StatCard label="Completed"    value={stats.movies.completed}  icon={CheckCircle2} accent="text-green-500" />
                    <StatCard label="Dropped"      value={stats.movies.dropped}    icon={TrendingUp} />
                    <StatCard
                      label="Mean Score"
                      value={stats.movies.meanScore ? `${stats.movies.meanScore}/10` : "—"}
                      icon={Star}
                      accent={stats.movies.meanScore ? "text-yellow-500" : undefined}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <StatusDonut data={stats.movies.statusDist} title="Status Breakdown" />
                    <ScoreDistribution data={stats.movies.scoreDist} title="Your Movie Scores" />
                  </div>
                </div>
              )}

              {/* ── Manga tab ── */}
              {tab === "manga" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Manga"  value={stats.manga.total}      icon={BookOpen} accent="text-orange-500" />
                    <StatCard label="Completed"    value={stats.manga.completed}   icon={CheckCircle2} accent="text-green-500" />
                    <StatCard label="Reading"      value={stats.manga.reading}     icon={TrendingUp} />
                    <StatCard label="Chapters"     value={stats.manga.chapters.toLocaleString()} icon={TrendingUp} />
                    <StatCard
                      label="Mean Score"
                      value={stats.manga.meanScore ? `${stats.manga.meanScore}/10` : "—"}
                      icon={Star}
                      accent={stats.manga.meanScore ? "text-yellow-500" : undefined}
                    />
                    <StatCard label="Dropped" value={stats.manga.dropped} icon={TrendingUp} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <StatusDonut data={stats.manga.statusDist} title="Status Breakdown" />
                    <ScoreDistribution data={stats.manga.scoreDist} title="Your Manga Scores" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
