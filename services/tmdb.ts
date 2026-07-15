// TMDB API service
const TMDB_API = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

// Search multi (movies + tv)
export const searchTMDB = async (query: string) => {
  const response = await fetch(
    `${TMDB_API}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error('Failed to search TMDB');
  }

  const data = await response.json();
  return data.results;
};

// Get movie details
export const getMovieDetails = async (id: number) => {
  const response = await fetch(
    `${TMDB_API}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,recommendations,similar`
  );

  if (!response.ok) {
    throw new Error('Failed to get movie details');
  }

  return response.json();
};

// Get TV details
export const getTVDetails = async (id: number) => {
  const response = await fetch(
    `${TMDB_API}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,recommendations,similar`
  );

  if (!response.ok) {
    throw new Error('Failed to get TV details');
  }

  return response.json();
};

// Get TMDB image URL
export const getTMDBImageUrl = (path: string, size: string = 'w500') => {
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
