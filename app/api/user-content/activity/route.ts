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

    const recentActivity = await prisma.userContent.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        content: true,
      },
      orderBy: {
        updated_at: 'desc'
      },
      take: 5
    });

    return successResponse(recentActivity);
  } catch (error: any) {
    console.error('Error in GET /api/user-content/activity:', error);
    return errorResponse('Failed to fetch recent activity', 500);
  }
}
