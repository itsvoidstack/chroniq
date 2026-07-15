import { useMemo, useState, useEffect } from 'react';
import { useSupabase } from '@/lib/providers/supabase-provider';

export type ContentType = 'anime' | 'movie' | 'tv' | 'book' | 'game';
export type UserContentStatus = 'plan_to_watch' | 'watching' | 'completed' | 'dropped' | 'on_hold';

export interface UserContent {
  id: string;
  user_id: string;
  content_id: string;
  status: UserContentStatus;
  progress: number;
  season_progress: number;
  rating: number | null;
  notes: string | null;
  start_date: string | null;
  finish_date: string | null;
  rewatch_count: number;
  favorite: boolean;
  created_at: string;
  updated_at: string;
  content: {
    id: string;
    type: ContentType;
    anilist_id: number | null;
    tmdb_id: number | null;
    created_at: string;
    updated_at: string;
  };
}

export const useUserContent = () => {
  const { user, isLoading: authLoading } = useSupabase();
  const [userContent, setUserContent] = useState<UserContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserContent = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/user-content');
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Expected JSON, got:', text.substring(0, 200));
        throw new Error(`Server error: Expected JSON but got HTML/text`);
      }

      const json = await res.json();
      
      if (!json.success) throw new Error(json.error || 'Failed to fetch user content');
      
      setUserContent(json.data as UserContent[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserContent();
    }
  }, [user, authLoading]);

  const addContent = async (
    type: ContentType,
    externalId: number,
    status: UserContentStatus = 'plan_to_watch'
  ) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/user-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, externalId, status })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server error: Expected JSON but got HTML/text`);
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to add content');
      
      await fetchUserContent();
    } catch (err: any) {
      setError(err.message || 'Failed to add content');
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (userContentId: string, updates: Partial<UserContent>) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/user-content/${userContentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server error: Expected JSON but got HTML/text`);
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to update content');
      
      await fetchUserContent();
    } catch (err: any) {
      setError(err.message || 'Failed to update content');
    } finally {
      setIsLoading(false);
    }
  };

  const removeContent = async (userContentId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/user-content/${userContentId}`, {
        method: 'DELETE'
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server error: Expected JSON but got HTML/text`);
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to remove content');
      
      await fetchUserContent();
    } catch (err: any) {
      setError(err.message || 'Failed to remove content');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (userContentId: string) => {
    if (!user) return;
    
    const current = userContent.find(c => c.id === userContentId);
    if (!current) return;

    // Optimistic update
    setUserContent(prev => prev.map(c => 
      c.id === userContentId ? { ...c, favorite: !c.favorite } : c
    ));

    try {
      const res = await fetch(`/api/user-content/${userContentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !current.favorite })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server error: Expected JSON but got HTML/text`);
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to toggle favorite');
    } catch (err: any) {
      setError(err.message || 'Failed to toggle favorite');
      // Revert optimistic update
      await fetchUserContent();
    }
  };

  // Derived state
  const groupedByStatus = useMemo(() => {
    const groups: Record<UserContentStatus, UserContent[]> = {
      plan_to_watch: [],
      watching: [],
      completed: [],
      dropped: [],
      on_hold: [],
    };
    
    userContent.forEach(uc => {
      if (groups[uc.status]) {
        groups[uc.status].push(uc);
      }
    });
    
    return groups;
  }, [userContent]);

  return {
    userContent,
    isLoading,
    error,
    groupedByStatus,
    addContent,
    updateContent,
    removeContent,
    toggleFavorite,
    refetch: fetchUserContent,
  };
};
