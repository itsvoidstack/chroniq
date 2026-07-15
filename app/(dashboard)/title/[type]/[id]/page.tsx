'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Play, Plus, RefreshCw, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUserContent } from '@/hooks/use-user-content';

interface TitleDetailsProps {
  params: {
    type: string;
    id: string;
  };
}

interface TitleData {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  year: number;
  status: string;
  episodes?: number;
  duration?: number;
  genres: string[];
}

export default function TitleDetailsPage({ params }: TitleDetailsProps) {
  const [titleData, setTitleData] = useState<TitleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState('1');
  const { userContent, addContent, updateContent } = useUserContent();
  
  const externalId = parseInt(params.id, 10);
  const contentType = params.type as 'anime' | 'movie' | 'tv';

  const userContentItem = userContent.find(
    (item) =>
      (contentType === 'anime' && item.content.anilist_id === externalId) ||
      (contentType !== 'anime' && item.content.tmdb_id === externalId)
  );

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/details?type=${contentType}&id=${externalId}`);
        const json = await res.json();
        if (json.success) {
          setTitleData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [contentType, externalId]);

  const handleAddToWatchlist = async () => {
    await addContent(contentType, externalId, 'plan_to_watch');
  };

  const handleSetWatching = async () => {
    if (userContentItem) {
      await updateContent(userContentItem.id, { status: 'watching' });
    } else {
      await addContent(contentType, externalId, 'watching');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!titleData) {
    return (
      <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Content not found</h1>
        <Link href="/search" className="text-primary hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 animate-in fade-in duration-500">
      
      {/* Banner Section */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] md:h-[50vh] w-full overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
        <img 
          src={titleData.bannerUrl || titleData.posterUrl} 
          alt="Banner" 
          className="w-full h-full object-cover opacity-40 object-top"
        />
      </div>

      <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        
        <Link href="/search" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Poster */}
          <div className="shrink-0 mx-auto lg:mx-0 w-[240px] md:w-[300px]">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-card/50">
              <img 
                src={titleData.posterUrl} 
                alt={titleData.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 space-y-6 pt-4">
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Title & Meta */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  {titleData.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
                  <span className="text-foreground">{titleData.year}</span>
                  {titleData.episodes && (
                    <>
                      <span>•</span>
                      <span>{titleData.episodes} Episodes</span>
                    </>
                  )}
                  {titleData.duration && (
                    <>
                      <span>•</span>
                      <span>{titleData.duration}m</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-green-500 capitalize">{titleData.status}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {titleData.genres.map(genre => (
                    <span key={genre} className="px-3 py-1 bg-secondary/50 text-secondary-foreground text-sm rounded-full border border-border/50">
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed max-w-3xl pt-2">
                  {titleData.description}
                </p>

                <div className="flex items-center gap-4 pt-4">
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 rounded-lg font-semibold shadow-lg shadow-primary/20"
                    onClick={handleSetWatching}
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    {userContentItem?.status === 'watching' ? 'Continue Watching' : 'Start Watching'}
                  </Button>
                  {!userContentItem ? (
                    <Button 
                      variant="outline" 
                      className="h-12 px-6 rounded-lg font-medium border-border/50 bg-card/50 backdrop-blur-sm"
                      onClick={handleAddToWatchlist}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add to Watchlist
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" className="h-12 w-12 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
                    <RefreshCw className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Progress Circle Widget */}
              {userContentItem && (
                <div className="shrink-0 p-6 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl flex flex-col items-center justify-center min-w-[200px]">
                  <p className="text-sm font-medium text-muted-foreground mb-4">Your Progress</p>
                  <ProgressRing 
                    progress={userContentItem.progress || 0} 
                    size={100} 
                    strokeWidth={8}
                    colorClassName="text-primary"
                  />
                  <div className="mt-4 text-center space-y-1">
                    <p className="font-semibold text-lg text-foreground">
                      {userContentItem.progress ? `Ep ${userContentItem.progress}` : 'Not started'}
                    </p>
                    <p className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block capitalize">
                      {userContentItem.status}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Tabs Section */}
            <div className="pt-8">
              <Tabs defaultValue="episodes" className="w-full">
                <TabsList className="w-full justify-start border-b border-border rounded-none h-12 bg-transparent space-x-8">
                  {['Episodes', 'Overview', 'Characters', 'Reviews', 'Similar'].map(tab => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab.toLowerCase()}
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 h-full text-muted-foreground data-[state=active]:text-foreground font-medium text-base"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="flex flex-col lg:flex-row gap-12 pt-8">
                  
                  {/* Main Tab Content */}
                  <div className="flex-1">
                    <TabsContent value="episodes" className="m-0 focus-visible:outline-none">
                      
                      {contentType === 'anime' || contentType === 'tv' ? (
                        <div className="mb-6">
                          <select 
                            value={activeSeason}
                            onChange={(e) => setActiveSeason(e.target.value)}
                            className="bg-card/50 border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none font-medium"
                          >
                            <option value="1">Season 1</option>
                          </select>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <p className="text-muted-foreground">Episode list coming soon!</p>
                      </div>

                    </TabsContent>
                  </div>

                  {/* Information Sidebar */}
                  <div className="w-full lg:w-72 shrink-0">
                    <h3 className="text-lg font-semibold mb-6">Information</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2 py-2">
                        <span className="text-muted-foreground">Genres</span>
                        <div className="flex flex-wrap gap-2">
                          {titleData.genres.map(g => (
                            <span key={g} className="text-xs font-medium text-foreground">{g}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </Tabs>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
