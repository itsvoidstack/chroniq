'use client';

import React, { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PosterCard } from '@/components/ui/poster-card';
import { SearchBar } from '@/components/ui/search-bar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, Grid, List, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ResponsiveGrid } from '@/components/ui/grid';
import { useUserContent } from '@/hooks/use-user-content';

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Media type selector just for demo purposes (usually would be routed /library/anime, /library/movies, etc.)
  const [mediaType, setMediaType] = useState('all');

  const { userContent, isLoading, toggleFavorite } = useUserContent();

  // Filter and sort user content
  const displayedData = useMemo(() => {
    let data = [...userContent];

    // Filter by media type
    if (mediaType !== 'all') {
      data = data.filter(item => item.content.type === mediaType);
    }

    // Filter by status
    if (activeTab !== 'all') {
      data = data.filter(item => item.status === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item => 
        item.content.title?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'title') {
      data.sort((a, b) => (a.content.title || '').localeCompare(b.content.title || ''));
    } else if (sortBy === 'added') {
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return data;
  }, [userContent, mediaType, activeTab, searchQuery, sortBy]);

  // Get counts for statuses
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0, watching: 0, completed: 0, on_hold: 0, dropped: 0, plan_to_watch: 0 };
    userContent.forEach(item => {
      counts.all++;
      if (counts[item.status] !== undefined) counts[item.status]++;
    });
    return counts;
  }, [userContent]);

  const statuses = [
    { value: 'all', label: 'All', count: statusCounts.all },
    { value: 'plan_to_watch', label: 'Plan to Watch', count: statusCounts.plan_to_watch },
    { value: 'watching', label: 'Watching', count: statusCounts.watching },
    { value: 'completed', label: 'Completed', count: statusCounts.completed },
    { value: 'on_hold', label: 'On Hold', count: statusCounts.on_hold },
    { value: 'dropped', label: 'Dropped', count: statusCounts.dropped },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 min-h-screen flex flex-col">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground capitalize">
            {mediaType === 'all' ? 'Library' : mediaType === 'tv' ? 'TV Shows' : mediaType}
          </h1>
          <Select value={mediaType} onValueChange={setMediaType}>
            <SelectTrigger className="w-[140px] h-9 bg-card border-border">
              <SelectValue placeholder="Change Media" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="movie">Movies</SelectItem>
              <SelectItem value="tv">TV Shows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs and Filter Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border/50 pb-px">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-transparent h-10 p-0 space-x-6 overflow-x-auto w-full justify-start rounded-none">
            {statuses.map((s) => (
              <TabsTrigger 
                key={s.value} 
                value={s.value}
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 h-full text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                {s.label} <span className="ml-2 text-xs opacity-50">({s.count})</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button variant="outline" size="sm" className="hidden md:flex gap-2 bg-card">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="w-full sm:w-80">
          <SearchBar 
            value={searchQuery} 
            onChange={(e: any) => setSearchQuery(e.target ? e.target.value : e)} 
            onClear={() => setSearchQuery('')}
            placeholder="Search library..."
            className="h-10 bg-card/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px] h-9 bg-card border-border">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="added">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center bg-card border border-border rounded-md p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayedData.length > 0 ? (
          <ResponsiveGrid columns={{ default: 2, sm: 3, md: 4, lg: 5, xl: 6 }} gap="md">
            {displayedData.map((item) => (
              <div key={item.id} className="group relative">
                <PosterCard
                  id={item.content.anilist_id || item.content.tmdb_id || 0}
                  title={item.content.title || 'Untitled'}
                  posterUrl={item.content.poster_url || ''}
                  type={item.content.type as any}
                  isFavorite={item.favorite || false}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    {item.progress ? `Ep ${item.progress}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </ResponsiveGrid>
        ) : (
          <div className="py-20 text-center border border-dashed rounded-xl border-border/50 bg-card/10">
            <p className="text-lg font-medium text-foreground mb-2">No items found</p>
            <p className="text-muted-foreground">Try adjusting your filters or add some content to your library.</p>
          </div>
        )}
      </div>

    </div>
  );
}
