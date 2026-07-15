import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchAnime } from '@/services/anilist';
import { searchTMDB, getTMDBImageUrl } from '@/services/tmdb';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'all';

    if (!query || !query.trim()) {
      return successResponse([]);
    }

    const promises = [];
    if (type === 'all' || type === 'anime') {
      promises.push(
        searchAnime(query)
          .then(res =>
            res.map((a: any) => ({
              id: a.id,
              title: a.title.english || a.title.romaji,
              posterUrl: a.coverImage.large,
              type: 'anime' as const,
            }))
          )
          .catch(err => {
            console.error('Error searching AniList:', err);
            return [];
          })
      );
    }

    if (type === 'all' || type === 'movie' || type === 'tv') {
      promises.push(
        searchTMDB(query)
          .then(res =>
            res
              .filter((t: any) => t.media_type === 'movie' || t.media_type === 'tv')
              .filter((t: any) => type === 'all' || type === t.media_type)
              .map((t: any) => ({
                id: t.id,
                title: t.title || t.name,
                posterUrl: t.poster_path ? getTMDBImageUrl(t.poster_path) : '',
                type: t.media_type as 'movie' | 'tv',
              }))
          )
          .catch(err => {
            console.error('Error searching TMDB:', err);
            return [];
          })
      );
    }

    const resArr = await Promise.all(promises);
    const combined = resArr.flat().filter(c => c.posterUrl);

    return successResponse(combined);
  } catch (error: any) {
    console.error('Error in GET /api/search:', error);
    return errorResponse(error.message || 'Failed to search', 500);
  }
}
