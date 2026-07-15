import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api';
import { getAnimeDetails } from '@/services/anilist';
import { getMovieDetails, getTVDetails, getTMDBImageUrl } from '@/services/tmdb';

async function getContentMetadata(type: string, externalId: number): Promise<{ title: string | null; poster_url: string | null }> {
  try {
    if (type === 'anime') {
      const anime = await getAnimeDetails(externalId);
      return {
        title: anime.title.english || anime.title.romaji || null,
        poster_url: anime.coverImage.large || null
      };
    } else if (type === 'movie') {
      const movie = await getMovieDetails(externalId);
      return {
        title: movie.title || null,
        poster_url: movie.poster_path ? getTMDBImageUrl(movie.poster_path) : null
      };
    } else if (type === 'tv') {
      const tv = await getTVDetails(externalId);
      return {
        title: tv.name || null,
        poster_url: tv.poster_path ? getTMDBImageUrl(tv.poster_path) : null
      };
    }
    return { title: null, poster_url: null };
  } catch (e) {
    console.error('Failed to fetch content metadata:', e);
    return { title: null, poster_url: null };
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const userContent = await prisma.userContent.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        content: true,
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    return successResponse(userContent);
  } catch (error: any) {
    console.error('Error in GET /api/user-content:', error);
    return errorResponse('Failed to fetch user content', 500);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { type, externalId, status = 'plan_to_watch' } = body;

    if (!type || !externalId) {
      return errorResponse('Missing required fields: type, externalId', 400);
    }

    // 1. Check if content exists
    let content = await prisma.content.findFirst({
      where: type === 'anime' ? { anilist_id: externalId } : { tmdb_id: externalId },
    });

    // Fetch metadata
    const metadata = await getContentMetadata(type, externalId);

    if (!content) {
      content = await prisma.content.create({
        data: {
          type,
          anilist_id: type === 'anime' ? externalId : null,
          tmdb_id: type !== 'anime' ? externalId : null,
          title: metadata.title,
          poster_url: metadata.poster_url
        },
      });
    } else {
      // Update metadata if needed
      if (!content.title || !content.poster_url) {
        content = await prisma.content.update({
          where: { id: content.id },
          data: {
            title: metadata.title || content.title,
            poster_url: metadata.poster_url || content.poster_url
          }
        });
      }
    }

    // 2. Upsert user content
    const userContent = await prisma.userContent.upsert({
      where: {
        user_id_content_id: {
          user_id: user.id,
          content_id: content.id,
        }
      },
      update: {
        status,
        updated_at: new Date(),
      },
      create: {
        user_id: user.id,
        content_id: content.id,
        status,
      },
      include: {
        content: true,
      }
    });

    return successResponse(userContent);
  } catch (error: any) {
    console.error('Error in POST /api/user-content:', error);
    return errorResponse('Failed to add content', 500);
  }
}
