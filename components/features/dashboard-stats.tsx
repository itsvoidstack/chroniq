'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, Clock, CheckCircle2, Flame } from 'lucide-react';

interface Stats {
  episodesWatched: number;
  titlesCompleted: number;
  hoursWatched: number;
  currentStreak: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/user-content/statistics');
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => <Card key={i} className="h-24" />)}
    </div>;
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center text-sm text-muted-foreground mb-1 gap-2">
            <PlayCircle className="w-4 h-4 text-primary" /> Episodes Watched
          </div>
          <div className="text-2xl font-bold">{stats.episodesWatched.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center text-sm text-muted-foreground mb-1 gap-2">
            <Clock className="w-4 h-4 text-primary" /> Hours Watched
          </div>
          <div className="text-2xl font-bold">{stats.hoursWatched.toLocaleString()}h</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center text-sm text-muted-foreground mb-1 gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" /> Titles Completed
          </div>
          <div className="text-2xl font-bold">{stats.titlesCompleted.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="flex items-center text-sm text-muted-foreground mb-1 gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> Current Streak
          </div>
          <div className="text-2xl font-bold">{stats.currentStreak} days</div>
        </CardContent>
      </Card>
    </div>
  );
}
