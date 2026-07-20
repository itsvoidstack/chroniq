"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/shell/header";
import {
  Play, Plus, TrendingUp, Radio,
  Activity, Loader2, Swords, Film, Tv, BookOpen,
  Chrome, PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface LibraryEntry {
  id: string;
  title: string;
  coverImage: string | null;
  mediaType: string;
  progress: number;
  totalCount: number | null;
  status: string;
  anilistId: number | null;
  tmdbId: number | null;
  updatedAt: string;
}

interface HistoryEvent {
  id: string;
  title: string;
  coverImage: string | null;
  mediaType: string;
  episodeNumber: number | null;
  chapterNumber: number | null;
  source: string;
  siteName: string | null;
  watchedAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const TYPE_HREF: Record<string, string> = { ANIME: "anime", MOVIE: "movie", TV: "tv", MANGA: "manga" };
const TYPE_ICON: Record<string, React.ElementType> = { ANIME: Swords, MOVIE: Film, TV: Tv, MANGA: BookOpen };
const TYPE_COLOR: Record<string, string> = {
  ANIME: "text-purple-500", MOVIE: "text-blue-500",
  TV: "text-green-500",     MANGA: "text-orange-500",
};

function entryHref(e: LibraryEntry) {
  const slug = TYPE_HREF[e.mediaType] ?? "anime";
  const id   = e.anilistId ?? e.tmdbId;
  return id ? `/${slug}/${id}` : "#";
}

function progressPct(progress: number, total: number | null) {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((progress / total) * 100));
}

function relTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function progressLabel(ev: HistoryEvent) {
  if (ev.mediaType === "MANGA" && ev.chapterNumber) return `Ch. ${ev.chapterNumber}`;
  if (ev.episodeNumber) return ev.mediaType === "MOVIE" ? "Watched" : `Ep. ${ev.episodeNumber}`;
  return "Logged";
}

// ─── Section header ─────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon, title, href, action = "See all",
}: {
  icon: React.ElementType; title: string; href?: string; action?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-xs text-primary hover:underline font-medium">
          {action}
        </Link>
      )}
    </div>
  );
}

// ─── Continue Watching card ──────────────────────────────────────────────────

function ContinueCard({ entry }: { entry: LibraryEntry }) {
  const pct  = progressPct(entry.progress, entry.totalCount);
  const unit = entry.mediaType === "MANGA" ? "Ch." : "Ep.";
  const Icon = TYPE_ICON[entry.mediaType] ?? Film;

  return (
    <Link href={entryHref(entry)} className="group block">
      <div className="rounded-xl border border-border bg-card p-4 flex gap-3 items-center hover:border-primary/40 hover:shadow-sm transition-all">
        <div className="h-14 w-10 rounded-lg bg-muted shrink-0 overflow-hidden border border-border">
          {entry.coverImage ? (
            <Image src={entry.coverImage} alt={entry.title} width={40} height={56} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{entry.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unit} {entry.progress}{entry.totalCount ? `/${entry.totalCount}` : ""}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="shrink-0 h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
          <Play className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}

// ─── Recently Added card ─────────────────────────────────────────────────────

function RecentCard({ entry }: { entry: LibraryEntry }) {
  return (
    <Link href={entryHref(entry)} className="group block">
      <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all">
        <div className="relative aspect-[2/3] bg-muted overflow-hidden">
          {entry.coverImage ? (
            <Image src={entry.coverImage} alt={entry.title} fill sizes="(max-width:640px) 45vw, 14vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Play className="h-6 w-6 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="p-2">
          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{entry.title}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Activity event row ───────────────────────────────────────────────────────

function ActivityRow({ event }: { event: HistoryEvent }) {
  const Icon  = TYPE_ICON[event.mediaType] ?? Film;
  const color = TYPE_COLOR[event.mediaType] ?? "text-muted-foreground";

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate font-medium">{event.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{progressLabel(event)}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            {event.source === "EXTENSION" ? <Chrome className="h-2.5 w-2.5" /> : <PenLine className="h-2.5 w-2.5" />}
            {event.source === "EXTENSION" ? (event.siteName ?? "Extension") : "Manual"}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{relTime(event.watchedAt)}</span>
    </div>
  );
}

// ─── Empty card placeholder ──────────────────────────────────────────────────

function EmptyCard({ label }: { label: string }) {
  return (
    <Link href="/discover" className="group block">
      <div className="rounded-xl border border-dashed border-border bg-card/50 overflow-hidden hover:border-primary/40 transition-colors">
        <div className="aspect-[2/3] flex items-center justify-center">
          <Plus className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </div>
        <div className="p-2">
          <p className="text-xs text-muted-foreground/60 truncate text-center">{label}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [data, setData] = useState<{
    continueWatching: LibraryEntry[];
    recentlyAdded: LibraryEntry[];
    recentActivity: HistoryEvent[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const continueWatching = data?.continueWatching ?? [];
  const recentlyAdded    = data?.recentlyAdded    ?? [];
  const recentActivity   = data?.recentActivity   ?? [];

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Home" />

      <main className="flex-1 p-6 pb-24 md:pb-6 space-y-10 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* ── Continue Watching ── */}
            <section>
              <SectionHeader icon={Play} title="Continue Watching" href="/library" />
              {continueWatching.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                  <p className="text-sm text-muted-foreground">Nothing in progress yet.</p>
                  <Link href="/discover" className="text-xs text-primary hover:underline mt-1 block">Browse titles to get started</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {continueWatching.map((e) => <ContinueCard key={e.id} entry={e} />)}
                </div>
              )}
            </section>

            {/* ── Recently Added ── */}
            <section>
              <SectionHeader icon={Plus} title="Recently Added" href="/library" action="View library" />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {recentlyAdded.map((e) => <RecentCard key={e.id} entry={e} />)}
                {recentlyAdded.length === 0 && Array.from({ length: 8 }).map((_, i) => (
                  <EmptyCard key={i} label="Discover" />
                ))}
              </div>
            </section>

            {/* ── Bottom row ── */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Trending (static prompt to Discover) */}
              <section>
                <SectionHeader icon={TrendingUp} title="Trending This Season" href="/discover?tab=seasonal" action="Seasonal chart" />
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">Discover what&apos;s airing this season.</p>
                  <Link href="/discover" className="text-xs text-primary hover:underline mt-1 block">Open Discover →</Link>
                </div>
              </section>

              {/* Activity Feed */}
              <section>
                <SectionHeader icon={Activity} title="Activity Feed" href="/history" action="View history" />
                {recentActivity.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">No activity yet. Start tracking!</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                    {recentActivity.map((ev) => <ActivityRow key={ev.id} event={ev} />)}
                    <div className="p-3 text-center">
                      <Link href="/history" className="text-xs text-primary hover:underline font-medium">View full history →</Link>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ── Currently Airing prompt ── */}
            <section>
              <SectionHeader icon={Radio} title="Currently Airing" href="/discover" action="Seasonal chart" />
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">See what&apos;s airing this season in Discover.</p>
                <Link href="/discover" className="text-xs text-primary hover:underline mt-1 block">Browse Seasonal Chart →</Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
