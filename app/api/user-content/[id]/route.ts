import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.userContent.findUnique({
      where: { id },
    });

    if (!existing || existing.user_id !== user.id) {
      return errorResponse('Not found or unauthorized', 404);
    }

    const updated = await prisma.userContent.update({
      where: { id },
      data: {
        ...body,
        updated_at: new Date(),
      },
      include: {
        content: true,
      }
    });

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error in PATCH /api/user-content/[id]:', error);
    return errorResponse('Failed to update content', 500);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.userContent.findUnique({
      where: { id },
    });

    if (!existing || existing.user_id !== user.id) {
      return errorResponse('Not found or unauthorized', 404);
    }

    await prisma.userContent.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/user-content/[id]:', error);
    return errorResponse('Failed to delete content', 500);
  }
}
