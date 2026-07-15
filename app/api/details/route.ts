import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAnimeDetails } from '@/services/anilist';
import { getMovieDetails, getTVDetails, getTMDBImageUrl } from '@/services/tmdb';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const idStr = searchParams.get('id');

    if (!type || !idStr) {
      return errorResponse('Missing required parameters: type, id', 400);
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return errorResponse('Invalid ID format', 400);
    }

    let details;
    if (type === 'anime') {
      const data = await getAnimeDetails(id);
      details = {
        id: data.id,
        title: data.title.english || data.title.romaji,
        description: data.description,
        posterUrl: data.coverImage.large,
        bannerUrl: data.bannerImage,
        year: data.seasonYear,
        status: data.status,
        episodes: data.episodes,
        duration: data.duration,
        genres: data.genres,
      };
    } else if (type === 'movie') {
      const data = await getMovieDetails(id);
      details = {
        id: data.id,
        title: data.title,
        description: data.overview,
        posterUrl: data.poster_path ? getTMDBImageUrl(data.poster_path) : '',
        bannerUrl: data.backdrop_path ? getTMDBImageUrl(data.backdrop_path, 'w1280') : '',
        year: data.release_date ? new Date(data.release_date).getFullYear() : null,
        status: data.status,
        episodes: null,
        duration: data.runtime,
        genres: data.genres.map((g: any) => g.name),
      };
    } else if (type === 'tv') {
      const data = await getTVDetails(id);
      details = {
        id: data.id,
        title: data.name,
        description: data.overview,
        posterUrl: data.poster_path ? getTMDBImageUrl(data.poster_path) : '',
        bannerUrl: data.backdrop_path ? getTMDBImageUrl(data.backdrop_path, 'w1280') : '',
        year: data.first_air_date ? new Date(data.first_air_date).getFullYear() : null,
        status: data.status,
        episodes: data.number_of_episodes,
        duration: data.episode_run_time?.[0],
        genres: data.genres.map((g: any) => g.name),
      };
    } else {
      return errorResponse('Unsupported media type', 400);
    }

    return successResponse(details);
  } catch (error: any) {
    console.error('Error in GET /api/details:', error);
    return errorResponse(error.message || 'Failed to fetch details', 500);
  }
}
