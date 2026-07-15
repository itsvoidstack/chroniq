'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { PosterCard } from '@/components/ui/poster-card';
import { useUserContent } from '@/hooks/use-user-content';
import { Search as SearchIcon, Filter, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchResult {
  id: number;
  title: string;
  posterUrl: string;
  type: 'anime' | 'movie' | 'tv';
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [type, setType] = useState<'all' | 'anime' | 'movie' | 'tv'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { userContent, toggleFavorite, addContent } = useUserContent();

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ query: debouncedQuery, type });
        const res = await fetch(`/api/search?${params}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        } else {
          setError(json.error || 'Failed to search');
        }
      } catch (err: any) {
        setError('Failed to search');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, type]);

  const isFavorited = (result: SearchResult) => {
    return userContent.some(c => 
      c.content.type === result.type &&
      ((result.type === 'anime' && c.content.anilist_id === result.id) ||
       (result.type !== 'anime' && c.content.tmdb_id === result.id)) &&
      c.favorite
    );
  };

  const getUcId = (result: SearchResult) => {
    return userContent.find(c => 
      c.content.type === result.type &&
      ((result.type === 'anime' && c.content.anilist_id === result.id) ||
       (result.type !== 'anime' && c.content.tmdb_id === result.id))
    )?.id;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Discover</h1>
        <p className="text-muted-foreground">Find your next favorite show or movie</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search for anime, movies, tv shows..." 
            className="w-full pl-10 h-12 text-lg bg-card/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={type} onValueChange={(val: any) => setType(val)}>
            <SelectTrigger className="w-[140px] h-12 bg-card/50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="movie">Movies</SelectItem>
              <SelectItem value="tv">TV Shows</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-12 px-4 bg-card/50">
            <Filter className="w-5 h-5 mr-2" /> Filters
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20 text-center">
          {error}
        </div>
      )}

      {!isLoading && !error && query.trim() && results.length === 0 && (
        <div className="py-24 text-center text-muted-foreground">
          No results found for "{query}"
        </div>
      )}

      {!isLoading && !error && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((item) => (
            <PosterCard
              key={`${item.type}-${item.id}`}
              id={item.id}
              title={item.title}
              posterUrl={item.posterUrl}
              type={item.type}
              isFavorite={isFavorited(item)}
              onToggleFavorite={() => {
                const ucId = getUcId(item);
                if (ucId) toggleFavorite(ucId);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
