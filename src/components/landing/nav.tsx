"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Chroniq</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "FAQ", href: "#faq" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden grid transition-all duration-300 ease-in-out border-border bg-background",
          open ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]"
        )}
      >
      <div className="overflow-hidden">
        <nav className="flex flex-col gap-1 px-4 py-3">
          {[
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "FAQ", href: "#faq" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="py-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 pb-1">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
        </div>
      </div>
    </header>
  );
}
