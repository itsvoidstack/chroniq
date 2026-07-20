import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Chrome } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, hsla(220, 90%, 56%, 0.12), transparent)",
        }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Now with browser extension sync
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
          Track everything you
          <br />
          <span className="text-primary">watch and read</span>{" "}
          in one place.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Manage anime, movies, TV shows, and manga manually or automatically
          with the Chroniq browser extension.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="xl" asChild>
            <Link href="/signup">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="#extension">
              <Chrome className="h-4 w-4" />
              Install Extension
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Free forever &middot; No credit card &middot; No piracy
        </p>
      </div>

      {/* Dashboard preview */}
      <div className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 overflow-hidden">
          {/* Fake browser chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="mx-auto flex-1 max-w-sm">
              <div className="h-6 rounded-md bg-border flex items-center px-3">
                <span className="text-xs text-muted-foreground">
                  chroniq.app/home
                </span>
              </div>
            </div>
          </div>
          {/* Placeholder */}
          <div className="aspect-[16/9] bg-gradient-to-br from-surface to-background flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">📺</div>
              <p className="text-sm text-muted-foreground font-medium">
                Your personal media dashboard
              </p>
              <p className="text-xs text-muted-foreground mt-1 opacity-60">
                Coming soon in Phase 3
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
