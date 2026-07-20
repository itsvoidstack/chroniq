"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  BookOpen,
  Clock,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { label: "Home",     href: "/home",     icon: Home },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Library",  href: "/library",  icon: BookOpen },
  { label: "History",  href: "/history",  icon: Clock },
  { label: "Stats",    href: "/stats",    icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 border-r border-border bg-card z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-base font-semibold tracking-tight">Chroniq</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User menu at bottom */}
        <div className="shrink-0 border-t border-border p-3">
          <UserMenu />
        </div>
      </aside>
    </TooltipProvider>
  );
}
