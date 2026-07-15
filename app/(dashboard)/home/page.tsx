'use client';

import React, { useState, useEffect } from 'react';
import { PosterCard } from '@/components/ui/poster-card';
import { StatCard } from '@/components/ui/stat-card';
import { Chart } from '@/components/ui/chart';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, CheckCircle, Clock, CalendarDays, Activity, Flame, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUserContent } from '@/hooks/use-user-content';
import { useSupabase } from '@/lib/providers/supabase-provider';
import { formatDistanceToNow } from 'date-fns';

interface Stats {
  episodesWatched: number;
  titlesCompleted: number;
  hoursWatched: number;
  currentStreak: number;
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useSupabase();
  const { userContent, groupedByStatus, isLoading: contentLoading, toggleFavorite } = useUserContent();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const isLoading = authLoading || contentLoading || statsLoading || activityLoading;

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/user-content/statistics');
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  // Fetch recent activity
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/user-content/activity');
        const json = await res.json();
        if (json.success) {
          setRecentActivity(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch activity:', err);
      } finally {
        setActivityLoading(false);
      }
    };

    if (user) {
      fetchActivity();
    }
  }, [user]);

  const dynamicStats = [
    { 
      title: 'Episodes Watched', 
      value: stats ? stats.episodesWatched.toLocaleString() : '0', 
      icon: <PlayCircle className="w-5 h-5" /> 
    },
    { 
      title: 'Hours Watched', 
      value: stats ? `${stats.hoursWatched.toLocaleString()}h` : '0h', 
      icon: <Clock className="w-5 h-5" /> 
    },
    { 
      title: 'Completed', 
      value: stats ? stats.titlesCompleted.toLocaleString() : '0', 
      icon: <CheckCircle className="w-5 h-5" /> 
    },
    { 
      title: 'Current Streak', 
      value: stats ? `${stats.currentStreak} days` : '0 days', 
      icon: <Flame className="w-5 h-5 text-orange-500" /> 
    },
  ];

  const continueWatching = groupedByStatus.watching.slice(0, 5);

  const weeklyActivityData = [
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 0 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 },
    { day: 'Fri', hours: 0 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 },
  ];

  const genreData = [
    { name: 'Action', value: 30, color: '#8b5cf6' },
    { name: 'Adventure', value: 25, color: '#3b82f6' },
    { name: 'Drama', value: 20, color: '#10b981' },
    { name: 'Fantasy', value: 15, color: '#f59e0b' },
    { name: 'Others', value: 10, color: '#64748b' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
            {getGreeting()}{' '}{user?.email ? `${user.email.split('@')[0]} 👋` : ''}
          </h1>
          <p className="text-muted-foreground">Let's continue your journey.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/search" 
            className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Discover New
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-card/50 rounded-xl animate-pulse" />
          ))
        ) : (
          dynamicStats.map((stat, i) => (
            <StatCard
              key={i}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Content Area (Left 2/3) */}
        <div className="xl:col-span-2 space-y-8 min-w-0">
          
          {/* Continue Watching */}
          <section>
            <SectionHeader 
              title="Continue Watching" 
              actionText="View all" 
              actionHref="/library"
            />
            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 snap-x">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[160px] max-w-[180px] h-[240px] bg-card/50 rounded-xl animate-pulse" />
                ))
              ) : continueWatching.length > 0 ? (
                continueWatching.map((item) => (
                  <div key={item.id} className="min-w-[140px] max-w-[160px] sm:min-w-[160px] sm:max-w-[180px] flex-shrink-0 snap-start">
                    <PosterCard
                      id={item.content.anilist_id || item.content.tmdb_id || 0}
                      title={item.content.title || 'Untitled'}
                      posterUrl={item.content.poster_url || ''}
                      type={item.content.type as any}
                      isFavorite={item.favorite || false}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                    />
                    <div className="mt-2 text-center">
                      <p className="text-xs font-semibold text-primary bg-primary/10 inline-block px-2 py-0.5 rounded-full">
                        {item.progress ? `Ep ${item.progress}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full py-10 text-center text-muted-foreground">
                  Start watching something to see it here!
                </div>
              )}
            </div>
          </section>

          {/* Weekly Activity Chart */}
          <section>
            <Card className="bg-card/50 border-border shadow-md backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Chart 
                  type="area" 
                  data={weeklyActivityData} 
                  xAxisKey="day" 
                  series={[{ key: 'hours', name: 'Hours Watched', color: 'hsl(var(--primary))' }]}
                  height={250}
                />
              </CardContent>
            </Card>
          </section>

        </div>

        {/* Right Sidebar Area (Right 1/3) */}
        <div className="space-y-8">
          
          {/* Top Genres */}
          <Card className="bg-card/50 border-border shadow-md backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg">Top Genres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Chart 
                  type="pie" 
                  data={genreData} 
                  xAxisKey="name" 
                  series={[{ key: 'value' }]}
                  height={220}
                  className="-mt-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card/50 border-border shadow-md backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="py-6 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-6">
                  {recentActivity.map((item, index) => (
                    <div key={item.id} className="flex gap-4 relative">
                      {index !== recentActivity.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-border -ml-px" />
                      )}
                      
                      <div className="relative z-10 w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center shrink-0 text-primary">
                        {item.status === 'watching' && <PlayCircle className="w-4 h-4" />}
                        {item.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                        {item.status === 'plan_to_watch' && <CalendarDays className="w-4 h-4" />}
                        {!['watching', 'completed', 'plan_to_watch'].includes(item.status) && <PlayCircle className="w-4 h-4" />}
                      </div>
                      
                      <div className="pt-1.5 space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">
                          {item.content.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  No recent activity
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-border text-center">
                <Link href="/profile" className="text-sm text-primary hover:underline font-medium">
                  View Full History
                </Link>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>

    </div>
  );
}
