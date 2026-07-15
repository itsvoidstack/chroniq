// AniList GraphQL API service
const ANILIST_API = 'https://graphql.anilist.co';

// Search anime query
export const searchAnime = async (query: string) => {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query ($search: String) {
          Page {
            media (search: $search, type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
              }
              episodes
              genres
            }
          }
        }
      `,
      variables: { search: query },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to search anime');
  }

  const data = await response.json();
  return data.data.Page.media;
};

// Get anime details by ID
export const getAnimeDetails = async (id: number) => {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query ($id: Int) {
          Media (id: $id, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
            }
            bannerImage
            episodes
            duration
            status
            season
            seasonYear
            genres
            averageScore
            meanScore
            popularity
            favourites
            studios {
              nodes {
                name
                isAnimationStudio
              }
            }
            relations {
              edges {
                relationType
                node {
                  id
                  type
                  title {
                    romaji
                    english
                  }
                  coverImage {
                    large
                  }
                }
              }
            }
            recommendations {
              nodes {
                mediaRecommendation {
                  id
                  type
                  title {
                    romaji
                    english
                  }
                  coverImage {
                    large
                  }
                }
              }
            }
          }
        }
      `,
      variables: { id },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get anime details');
  }

  const data = await response.json();
  return data.data.Media;
};
