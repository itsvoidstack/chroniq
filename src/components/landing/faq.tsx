"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is Chroniq free?",
    a: "Yes. Chroniq is completely free to use. There are no subscriptions, no premium tiers, and no hidden costs.",
  },
  {
    q: "Does Chroniq host or stream any content?",
    a: "No. Chroniq is a tracking platform only. We do not host, stream, download, or embed any videos or pirated content. Think of it like Letterboxd for anime and manga.",
  },
  {
    q: "Which streaming sites does the extension support?",
    a: "The extension can work with any site you choose to whitelist. By default it comes pre-configured for Crunchyroll, HIDIVE, and Netflix. You can add or remove sites in Settings.",
  },
  {
    q: "Can I use Chroniq without the extension?",
    a: "Absolutely. The browser extension is entirely optional. You can manually track everything through the website.",
  },
  {
    q: "Where does my data come from?",
    a: "Anime data is sourced from AniList and Jikan. Movie and TV data comes from TMDB. All metadata is fetched from these public APIs — Chroniq never scrapes streaming sites.",
  },
  {
    q: "Can I import from MyAnimeList or AniList?",
    a: "AniList import is planned for a future update. MAL import is also on the roadmap. For now you can add titles manually or via search.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your library and watch history are private to your account by default. We do not sell or share your data.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know before getting started.
          </p>
        </div>

        <div className="divide-y divide-border">
          {faqs.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  className="flex w-full items-center justify-between py-5 text-left gap-4 group"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}
                  >
                    {q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "shrink-0 h-4 w-4 text-muted-foreground transition-transform duration-300 ease-in-out",
                      isOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>

                {/* Grid rows trick: animates height reliably without JS measuring */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-muted-foreground leading-relaxed pb-5">
                      {a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
