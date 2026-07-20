"use client";

import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/user-store";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { username, avatarUrl } = useUserStore();

  const initials = username ? username.slice(0, 2).toUpperCase() : "??";

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      {/* Page title */}
      <div>
        {title && (
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        {/* User avatar — visible only on mobile (sidebar handles it on desktop) */}
        <div className="md:hidden ml-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} alt={username ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
