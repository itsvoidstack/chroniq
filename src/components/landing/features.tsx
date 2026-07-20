import {
  BookOpen,
  Chrome,
  Film,
  BarChart3,
  Clock,
  Search,
  Star,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Film,
    title: "All media in one place",
    description:
      "Track anime, movies, TV shows, and manga from a single unified dashboard.",
  },
  {
    icon: Chrome,
    title: "Browser extension sync",
    description:
      "Install the Chroniq extension and your watch activity syncs automatically from whitelisted sites.",
  },
  {
    icon: BookOpen,
    title: "Smart library",
    description:
      "Organize with statuses like Watching, Completed, On Hold, and Plan to Watch — with full progress tracking.",
  },
  {
    icon: BarChart3,
    title: "Detailed statistics",
    description:
      "See your watch time, genre breakdown, completion rate, and mean score — beautifully visualized.",
  },
  {
    icon: Clock,
    title: "Watch history",
    description:
      "A chronological timeline of everything you've watched or read, with source info.",
  },
  {
    icon: Search,
    title: "Discover anything",
    description:
      "Search anime via AniList, movies and TV via TMDB — all from one search bar.",
  },
  {
    icon: Star,
    title: "Scores and notes",
    description:
      "Rate anything on a 1–10 scale. Keep private notes for each title in your library.",
  },
  {
    icon: Zap,
    title: "Fast and minimal",
    description:
      "Built for speed. No bloat, no ads, no dark patterns. Just your media, organized.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Everything you need to track media
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Chroniq combines the best parts of MyAnimeList, Letterboxd, and a
            personal reading log — in one clean interface.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
