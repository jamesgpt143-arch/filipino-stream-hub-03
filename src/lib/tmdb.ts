const API_KEY = '2283c405a7e1d26a6b72a786916aad85';
const API_BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string;
}

export interface Episode {
  id: number;
  name: string;
  episode_number: number;
  overview: string;
  still_path: string;
  air_date: string;
}

export const tmdbApi = {
  // Get popular movies
  getPopularMovies: async (page = 1): Promise<{ results: Movie[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    return response.json();
  },

  // Get popular TV shows
  getPopularTVShows: async (page = 1): Promise<{ results: TVShow[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
    return response.json();
  },

  // Search movies
  searchMovies: async (query: string, page = 1): Promise<{ results: Movie[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    return response.json();
  },

  // Search TV shows
  searchTVShows: async (query: string, page = 1): Promise<{ results: TVShow[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    return response.json();
  },

  // Get movie details
  getMovieDetails: async (movieId: number): Promise<Movie> => {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    return response.json();
  },

  // Get TV show details
  getTVShowDetails: async (showId: number): Promise<TVShow> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}?api_key=${API_KEY}`);
    return response.json();
  },

  // Get TV show seasons
  getTVShowSeasons: async (showId: number): Promise<{ seasons: Season[] }> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}?api_key=${API_KEY}`);
    return response.json();
  },

  // Get season episodes
  getSeasonEpisodes: async (showId: number, seasonNumber: number): Promise<{ episodes: Episode[] }> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${API_KEY}`);
    return response.json();
  },

  // Helper to get full image URL
  getImageUrl: (path: string, size = 'w500') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder.svg';
  },

  // Get video URLs for streaming with multiple servers
  getMovieStreamUrls: (movieId: number) => {
    return {
      'Server 1': `https://vidlink.pro/movie/${movieId}`,
      'Server 2': `https://multiembed.mov/?video_id=${movieId}&tmdb=1`
    };
  },

  // Get video URL for streaming (deprecated - use getMovieStreamUrls)
  getMovieStreamUrl: (movieId: number) => {
    return `https://vidlink.pro/movie/${movieId}`;
  },

  // Get TV show episode stream URLs with multiple servers
  getTVEpisodeStreamUrls: (showId: number, season: number, episode: number) => {
    return {
      'Server 1': `https://vidlink.pro/tv/${showId}/${season}/${episode}`,
      'Server 2': `https://multiembed.mov/?video_id=${showId}&tmdb=1&s=${season}&e=${episode}`
    };
  },

  // Get TV show episode stream URL (deprecated - use getTVEpisodeStreamUrls)
  getTVEpisodeStreamUrl: (showId: number, season: number, episode: number) => {
    return `https://vidlink.pro/tv/${showId}/${season}/${episode}`;
  }
};