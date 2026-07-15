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

    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    // If profile does not exist yet (first-time sign in or seeded user), create it
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          bio: '',
        },
      });
    }

    return successResponse(profile);
  } catch (error: any) {
    console.error('Error in GET /api/profile:', error);
    return errorResponse('Failed to fetch profile', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { displayName, bio } = body;

    const profile = await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        display_name: displayName,
        bio,
        updated_at: new Date(),
      },
      create: {
        id: user.id,
        display_name: displayName || 'User',
        bio: bio || '',
      },
    });

    return successResponse(profile);
  } catch (error: any) {
    console.error('Error in PUT /api/profile:', error);
    return errorResponse('Failed to update profile', 500);
  }
}
