'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserContent } from '@/hooks/use-user-content';
import { PlayCircle, CheckCircle2, BookmarkPlus, PauseCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function DashboardActivity() {
  const [activity, setActivity] = useState<UserContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/user-content/activity');
        const json = await res.json();
        if (json.success) {
          setActivity(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'watching': return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'plan_to_watch': return <BookmarkPlus className="w-4 h-4 text-purple-500" />;
      case 'on_hold': return <PauseCircle className="w-4 h-4 text-yellow-500" />;
      case 'dropped': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <PlayCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string, progress: number, type: string) => {
    switch(status) {
      case 'watching': return `Watched Episode ${progress}`;
      case 'completed': return `Completed ${type}`;
      case 'plan_to_watch': return `Added to Plan to Watch`;
      case 'on_hold': return `Put on hold at Episode ${progress}`;
      case 'dropped': return `Dropped at Episode ${progress}`;
      default: return `Updated status`;
    }
  };

  if (isLoading) {
    return <Card><CardContent className="p-6 h-64 flex items-center justify-center">Loading activity...</CardContent></Card>;
  }

  if (activity.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.map((item) => (
            <div key={item.id} className="flex gap-4 items-start">
              <div className="w-12 h-16 bg-muted rounded overflow-hidden shrink-0">
                {/* Normally we'd fetch the title/poster based on TMDB/Anilist ID here */}
                {/* For now, placeholder */}
                <div className="w-full h-full bg-secondary flex items-center justify-center text-xs text-muted-foreground uppercase">
                  {item.content.type}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(item.status)}
                  <p className="text-sm font-medium truncate">
                    {getStatusText(item.status, item.progress, item.content.type)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
