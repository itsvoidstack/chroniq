'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Library, 
  Bookmark, 
  Film, 
  Tv, 
  PlaySquare, 
  Folders, 
  Calendar, 
  Activity, 
  BarChart3, 
  History, 
  Settings 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/library', label: 'Library', icon: Library },
    { href: '/lists', label: 'Watchlist', icon: Bookmark },
    { href: '/movies', label: 'Movies', icon: Film },
    { href: '/tv', label: 'TV Shows', icon: Tv },
    { href: '/anime', label: 'Anime', icon: PlaySquare },
    { href: '/collections', label: 'Collections', icon: Folders },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/activity', label: 'Activity', icon: Activity },
    { href: '/statistics', label: 'Statistics', icon: BarChart3 },
    { href: '/history', label: 'History', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[260px] border-r border-border/40 bg-card h-screen flex flex-col shrink-0">
      
      {/* Logo */}
      <div className="h-20 flex items-center px-6 gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-primary-foreground font-bold text-lg leading-none">C</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">Chroniq</span>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname === '/home' && item.href === '/') || (pathname === '/' && item.href === '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 mt-auto">
        <Link href="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors group">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground">Aarav</span>
            <span className="text-xs text-muted-foreground">View Profile</span>
          </div>
        </Link>
      </div>
    </aside>
  );
};