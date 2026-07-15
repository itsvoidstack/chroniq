'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Moon, Sun, Search, User, LogOut } from 'lucide-react';
import { useTheme } from '@/lib/providers/theme-provider';
import { useSupabase } from '@/lib/providers/supabase-provider';
import { createClient } from '@/lib/supabase/client';
import { SearchModal } from '@/components/features/search-modal';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useSupabase();
  const supabase = createClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <React.Fragment>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <nav className="w-full h-16 border-b border-border bg-background flex items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">C</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">Chroniq</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-8">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-muted-foreground text-left"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search anime, movies, TV...</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-md hover:bg-secondary transition-colors md:hidden"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-3 hover:bg-secondary transition-colors">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 px-4 py-3 hover:bg-secondary transition-colors">
                    <Sun className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-secondary transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </React.Fragment>
  );
};