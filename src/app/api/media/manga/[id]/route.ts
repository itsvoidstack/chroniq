import { NextRequest, NextResponse } from "next/server";

const ANILIST_URL = "https://graphql.anilist.co";

const DETAIL_QUERY = `
query GetMangaDetail($id: Int) {
  Media(id: $id, type: MANGA) {
    id type
    title { romaji english native }
    coverImage { extraLarge large color }
    bannerImage
    description(asHtml: false)
    genres
    tags { name rank isMediaSpoiler }
    averageScore meanScore popularity favourites
    chapters volumes
    status
    startDate { year month day }
    endDate { year month day }
    format
    source
    staff(perPage: 4) {
      nodes { id name { full } image { medium } siteUrl }
      edges { role }
    }
    characters(perPage: 6, sort: [ROLE, RELEVANCE]) {
      nodes { id name { full } image { medium } siteUrl }
      edges { role }
    }
    recommendations(perPage: 8, sort: [RATING_DESC]) {
      nodes {
        mediaRecommendation {
          id type
          title { romaji english }
          coverImage { large color }
          averageScore chapters
          format status
        }
      }
    }
    relations {
      edges {
        relationType
        node {
          id type format status
          title { romaji english }
          coverImage { large }
        }
      }
    }
    externalLinks { id url site type }
    siteUrl
  }
}
`;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: DETAIL_QUERY, variables: { id } }),
      next: { revalidate: 3600 },
    });
    const json = await res.json();
    if (json.errors) return NextResponse.json({ error: json.errors[0].message }, { status: 404 });
    return NextResponse.json({ media: json.data.Media });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
