'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserContent } from '@/hooks/use-user-content';

export default function StatisticsPage() {
  const { userContent, isLoading, groupedByStatus } = useUserContent();

  // Count by type
  const countByType = {
    anime: userContent.filter(c => c.content.type === 'anime').length,
    movie: userContent.filter(c => c.content.type === 'movie').length,
    tv: userContent.filter(c => c.content.type === 'tv').length,
    game: userContent.filter(c => c.content.type === 'game').length,
  };

  // Average rating
  const ratedContent = userContent.filter(c => c.rating);
  const avgRating = ratedContent.length > 0 
    ? (ratedContent.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedContent.length).toFixed(1)
    : 0;

  // Total watched
  const totalCompleted = groupedByStatus.completed.length;
  
  // Favorites
  const totalFavorites = userContent.filter(c => c.favorite).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Statistics</h1>
        <p className="text-muted-foreground">Your tracking stats</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{userContent.length}</CardTitle>
            <CardDescription>Total in Library</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalCompleted}</CardTitle>
            <CardDescription>Completed</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{avgRating}</CardTitle>
            <CardDescription>Average Rating</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{groupedByStatus.watching.length}</CardTitle>
            <CardDescription>Watching Now</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalFavorites}</CardTitle>
            <CardDescription>Favorites</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By Type</CardTitle>
          <CardDescription>Breakdown of content in your library</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Anime</span>
            <span className="font-medium">{countByType.anime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Movies</span>
            <span className="font-medium">{countByType.movie}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>TV Shows</span>
            <span className="font-medium">{countByType.tv}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Games</span>
            <span className="font-medium">{countByType.game}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
