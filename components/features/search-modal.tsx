'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PosterCard } from '@/components/ui/poster-card';
import { searchAnime, getAnimeDetails } from '@/services/anilist';
import { searchTMDB, getTMDBImageUrl } from '@/services/tmdb';
import { useUserContent } from '@/hooks/use-user-content';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchResult = {
  id: number;
  title: string;
  posterUrl: string;
  type: 'anime' | 'movie' | 'tv';
};

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addContent } = useUserContent();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [animeResults, tmdbResults] = await Promise.all([
        searchAnime(searchQuery),
        searchTMDB(searchQuery),
      ]);

      const combinedResults: SearchResult[] = [
        ...animeResults.map((anime: any) => ({
          id: anime.id,
          title: anime.title.english || anime.title.romaji,
          posterUrl: anime.coverImage.large,
          type: 'anime' as const,
        })),
        ...tmdbResults
          .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
          .map((item: any) => ({
            id: item.id,
            title: item.title || item.name,
            posterUrl: item.poster_path ? getTMDBImageUrl(item.poster_path) : '',
            type: item.media_type as 'movie' | 'tv',
          })),
      ];

      setResults(combinedResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-background border border-border rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime, movies, TV shows..."
            className="flex-1 border-none shadow-none focus-visible:ring-0"
            autoFocus
          />
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((result) => (
                <PosterCard
                  key={`${result.type}-${result.id}`}
                  id={result.id}
                  title={result.title}
                  posterUrl={result.posterUrl}
                  type={result.type}
                  onClick={() => {
                    addContent(result.type, result.id);
                    onClose();
                  }}
                />
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-12 text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Start typing to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
