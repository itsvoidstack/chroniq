import { NextRequest, NextResponse } from "next/server";
import { getGenres } from "@/lib/api/anilist";
import { getMovieGenres, getTVGenres } from "@/lib/api/tmdb";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "anime";

  try {
    if (type === "movie") {
      const genres = await getMovieGenres();
      return NextResponse.json({ genres });
    }
    if (type === "tv") {
      const genres = await getTVGenres();
      return NextResponse.json({ genres });
    }
    // anime / manga — AniList
    const genres = await getGenres();
    return NextResponse.json({ genres });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
