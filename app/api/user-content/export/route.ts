import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { unauthorizedResponse } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const userContent = await prisma.userContent.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        content: true,
      },
    });

    if (format === 'csv') {
      const header = ['ID,Type,External ID,Status,Progress,Rating,Favorite'];
      const rows = userContent.map(uc => {
        return `${uc.id},${uc.content.type},${uc.content.anilist_id || uc.content.tmdb_id},${uc.status},${uc.progress},${uc.rating || ''},${uc.favorite}`;
      });
      const csv = [...header, ...rows].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="chroniq-export.csv"',
        },
      });
    }

    // Default to JSON
    return new NextResponse(JSON.stringify(userContent, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="chroniq-export.json"',
      },
    });
  } catch (error: any) {
    console.error('Error in Export:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
