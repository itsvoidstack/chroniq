import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Chrome, CheckCircle2, Shield, Zap } from "lucide-react";

const perks = [
  {
    icon: Shield,
    title: "You control which sites are tracked",
    description:
      "Only sites you explicitly whitelist are ever monitored. Everything else is ignored.",
  },
  {
    icon: Zap,
    title: "Instant sync",
    description:
      "A confirmation popup appears after you finish an episode. One click and it's logged.",
  },
  {
    icon: CheckCircle2,
    title: "No data stored in the extension",
    description:
      "The extension only sends events to your Chroniq account. No local storage of watch data.",
  },
];

export function ExtensionShowcase() {
  return (
    <section id="extension" className="py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              <Chrome className="h-3.5 w-3.5" />
              Browser Extension
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
              Track automatically,
              <br />
              without thinking about it.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              The Chroniq extension detects finished episodes on streaming sites
              you approve, then asks for confirmation before logging anything.
              You stay in control at all times.
            </p>

            <div className="space-y-5 mb-10">
              {perks.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild>
              <Link href="#">
                <Chrome className="h-4 w-4" />
                Install for Chrome
              </Link>
            </Button>
          </div>

          {/* Extension popup mockup */}
          <div className="flex justify-center">
            <div className="w-80 rounded-xl border border-border bg-card shadow-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">C</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Chroniq</p>
                  <p className="text-xs text-muted-foreground">
                    Episode detected
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-3 mb-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Just watched
                </p>
                <p className="text-sm font-medium">Attack on Titan</p>
                <p className="text-xs text-muted-foreground">
                  Season 4, Episode 21
                </p>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                Log this episode to your Chroniq library?
              </p>

              <div className="flex gap-2">
                <button className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-white hover:bg-primary/90 transition-colors">
                  Yes, log it
                </button>
                <button className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors">
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
