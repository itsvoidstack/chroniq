import { NextRequest, NextResponse } from "next/server";

const ANILIST_URL = "https://graphql.anilist.co";

const DETAIL_QUERY = `
query GetAnimeDetail($id: Int) {
  Media(id: $id, type: ANIME) {
    id type
    title { romaji english native }
    coverImage { extraLarge large color }
    bannerImage
    description(asHtml: false)
    genres
    tags { name rank isMediaSpoiler }
    averageScore meanScore popularity favourites
    episodes chapters volumes
    status season seasonYear
    startDate { year month day }
    endDate { year month day }
    format duration
    source
    studios { nodes { id name isAnimationStudio siteUrl } }
    staff(perPage: 6) {
      nodes { id name { full } image { medium } siteUrl }
      edges { role }
    }
    characters(perPage: 6, sort: [ROLE, RELEVANCE]) {
      nodes { id name { full } image { medium } siteUrl }
      edges { role voiceActors(language: JAPANESE) { id name { full } image { medium } } }
    }
    recommendations(perPage: 8, sort: [RATING_DESC]) {
      nodes {
        mediaRecommendation {
          id type
          title { romaji english }
          coverImage { large color }
          averageScore episodes chapters
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
    externalLinks { id url site type language color icon }
    streamingEpisodes { title thumbnail url site }
    nextAiringEpisode { episode airingAt timeUntilAiring }
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
