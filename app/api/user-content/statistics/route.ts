import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api';

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
    });

    const episodesWatched = userContent.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    const titlesCompleted = userContent.filter(c => c.status === 'completed').length;
    
    // Naive hours calculation: assuming average 24m per episode, 120m per movie
    let minutesWatched = 0;
    userContent.forEach(uc => {
      if (uc.content.type === 'anime' || uc.content.type === 'tv') {
        minutesWatched += (uc.progress || 0) * 24;
      } else if (uc.content.type === 'movie' && uc.status === 'completed') {
        minutesWatched += 120;
      }
    });
    const hoursWatched = Math.floor(minutesWatched / 60);
    
    // Calculate streak from updated_at dates
    const updateDates = Array.from(new Set(userContent
      .map(c => c.updated_at ? new Date(c.updated_at).toDateString() : null)
      .filter((d): d is string => d !== null)
    )).map(d => new Date(d));

    updateDates.sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    if (updateDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let lastDate = new Date(updateDates[0]);
      lastDate.setHours(0, 0, 0, 0);

      // Streak is active if the latest activity was today or yesterday
      if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        for (let i = 1; i < updateDates.length; i++) {
          const checkDate = new Date(updateDates[i]);
          checkDate.setHours(0, 0, 0, 0);
          
          const diffTime = lastDate.getTime() - checkDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
            lastDate = checkDate;
          } else if (diffDays > 1) {
            break;
          }
        }
      }
    }

    return successResponse({
      episodesWatched,
      titlesCompleted,
      hoursWatched,
      currentStreak,
    });
  } catch (error: any) {
    console.error('Error in GET /api/user-content/statistics:', error);
    return errorResponse('Failed to fetch statistics', 500);
  }
}
