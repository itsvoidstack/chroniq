"use client";

import { useState } from "react";
import { Header } from "@/components/shell/header";
import { SearchBar } from "@/components/discover/search-bar";
import { BrowseAnime } from "@/components/discover/browse-anime";
import { BrowseMovies } from "@/components/discover/browse-movies";
import { BrowseManga } from "@/components/discover/browse-manga";
import { SeasonalChart } from "@/components/discover/seasonal-chart";
import { TopCharts } from "@/components/discover/top-charts";
import { cn } from "@/lib/utils";
import { Search, Swords, Film, BookOpen, Radio, Trophy } from "lucide-react";

type Tab = "search" | "anime" | "movies" | "manga" | "seasonal" | "top";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "search",   label: "Search",   icon: Search },
  { id: "anime",    label: "Anime",    icon: Swords },
  { id: "movies",   label: "Movies & TV", icon: Film },
  { id: "manga",    label: "Manga",    icon: BookOpen },
  { id: "seasonal", label: "Seasonal", icon: Radio },
  { id: "top",      label: "Top Charts", icon: Trophy },
];

export default function DiscoverPage() {
  const [tab, setTab] = useState<Tab>("search");

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Discover" />

      <main className="flex-1 pb-24 md:pb-8">
        {/* Tab bar */}
        <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto scrollbar-none -mb-px gap-0">
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

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {tab === "search" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-2">
                <h2 className="text-xl font-semibold tracking-tight">
                  Search everything
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Anime, movies, TV shows, and manga — all in one place.
                </p>
              </div>
              <SearchBar autoFocus />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { label: "Browse Anime", tab: "anime" as Tab, icon: Swords, color: "text-purple-500 bg-purple-500/10" },
                  { label: "Browse Movies", tab: "movies" as Tab, icon: Film, color: "text-blue-500 bg-blue-500/10" },
                  { label: "Browse Manga", tab: "manga" as Tab, icon: BookOpen, color: "text-orange-500 bg-orange-500/10" },
                  { label: "Seasonal Chart", tab: "seasonal" as Tab, icon: Radio, color: "text-green-500 bg-green-500/10" },
                ].map(({ label, tab: t, icon: Icon, color }) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "anime" && <BrowseAnime />}
          {tab === "movies" && <BrowseMovies />}
          {tab === "manga" && <BrowseManga />}
          {tab === "seasonal" && <SeasonalChart />}
          {tab === "top" && <TopCharts />}
        </div>
      </main>
    </div>
  );
}
