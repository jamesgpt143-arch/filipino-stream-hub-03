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
  seasons?: Season[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string;
  overview: string;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  episode_number: number;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export const tmdbApi = {
  // =========================================================
  // 1. MOVIES LOGIC (Nandito pa rin sa taas)
  // =========================================================
  
  // Get Popular Movies (with Genre Filter support)
  getPopularMovies: async (page = 1, genreId?: number | null): Promise<{ results: Movie[]; total_pages: number }> => {
    // If NO genre filter, use standard popular endpoint
    if (!genreId) {
        const response = await fetch(`${API_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
        return response.json();
    }
    // If WITH genre, use discover endpoint (Server-Side Filtering)
    const response = await fetch(`${API_BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc&with_genres=${genreId}`);
    return response.json();
  },

  // Search Movies
  searchMovies: async (query: string, page = 1): Promise<{ results: Movie[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    return response.json();
  },

  // Get Movie Details
  getMovieDetails: async (movieId: number): Promise<Movie> => {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    return response.json();
  },

  // Get Movie Recommendations
  getMovieRecommendations: async (movieId: number, page = 1): Promise<{ results: Movie[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&page=${page}`);
    return response.json();
  },

  // Get Movie Trailers
  getMovieVideos: async (movieId: number): Promise<{ results: Video[] }> => {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    return response.json();
  },

  // Get Movie Stream URLs
  getMovieStreamUrls: (movieId: number) => {
    return {
      'Server 1': `https://vidlink.pro/movie/${movieId}`,
      'Server 2': `https://multiembed.mov/?video_id=${movieId}&tmdb=1`
    };
  },

  // (Deprecated) Single Stream URL - Kept for compatibility
  getMovieStreamUrl: (movieId: number) => {
    return `https://vidlink.pro/movie/${movieId}`;
  },

  // =========================================================
  // 2. TV SERIES LOGIC
  // =========================================================

  // Get Popular TV Shows (with Genre Filter support)
  getPopularTVShows: async (page = 1, genreId?: number | null): Promise<{ results: TVShow[]; total_pages: number }> => {
    if (!genreId) {
      const response = await fetch(`${API_BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
      return response.json();
    }
    const response = await fetch(`${API_BASE_URL}/discover/tv?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc&with_genres=${genreId}`);
    return response.json();
  },

  // Get Popular Anime (Specific Filter)
  getPopularAnime: async (page = 1): Promise<{ results: TVShow[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=${page}`);
    return response.json();
  },

  // Search TV Shows
  searchTVShows: async (query: string, page = 1): Promise<{ results: TVShow[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    return response.json();
  },

  // Search Anime
  searchAnime: async (query: string, page = 1): Promise<{ results: TVShow[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    const data = await response.json();
    const filteredResults = data.results.filter((show: TVShow) => show.genre_ids?.includes(16));
    return { results: filteredResults, total_pages: data.total_pages };
  },

  // Get TV Details
  getTVShowDetails: async (showId: number): Promise<TVShow> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}?api_key=${API_KEY}`);
    return response.json();
  },

  // Get Season Details
  getTVSeasonDetails: async (showId: number, seasonNumber: number): Promise<Season> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${API_KEY}`);
    return response.json();
  },

  // Get All Seasons
  getTVShowSeasons: async (showId: number): Promise<{ seasons: Season[] }> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}?api_key=${API_KEY}`);
    return response.json();
  },

  // Get Episodes
  getSeasonEpisodes: async (showId: number, seasonNumber: number): Promise<{ episodes: Episode[] }> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${API_KEY}`);
    return response.json();
  },

  // Get TV Recommendations
  getTVShowRecommendations: async (showId: number, page = 1): Promise<{ results: TVShow[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}/recommendations?api_key=${API_KEY}&page=${page}`);
    return response.json();
  },

  // Get Anime Recommendations
  getAnimeRecommendations: async (showId: number, page = 1): Promise<{ results: TVShow[]; total_pages: number }> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}/recommendations?api_key=${API_KEY}&page=${page}`);
    const data = await response.json();
    const filteredResults = data.results.filter((show: TVShow) => show.genre_ids?.includes(16));
    return { results: filteredResults.length > 0 ? filteredResults : data.results, total_pages: data.total_pages };
  },

  // Get TV Trailers
  getTVShowVideos: async (showId: number): Promise<{ results: Video[] }> => {
    const response = await fetch(`${API_BASE_URL}/tv/${showId}/videos?api_key=${API_KEY}`);
    return response.json();
  },

  // Get TV Episode Streams
  getTVEpisodeStreamUrls: (showId: number, season: number, episode: number) => {
    return {
      'Server 1': `https://vidlink.pro/tv/${showId}/${season}/${episode}`,
      'Server 2': `https://multiembed.mov/?video_id=${showId}&tmdb=1&s=${season}&e=${episode}`
    };
  },

  // (Deprecated) Single TV Stream
  getTVEpisodeStreamUrl: (showId: number, season: number, episode: number) => {
    return `https://vidlink.pro/tv/${showId}/${season}/${episode}`;
  },

  // Get Anime Streams (Same logic as TV)
  getAnimeEpisodeStreamUrls: (showId: number, season: number, episode: number) => {
    return {
      'Server 1': `https://vidlink.pro/tv/${showId}/${season}/${episode}`,
      'Server 2': `https://multiembed.mov/?video_id=${showId}&tmdb=1&s=${season}&e=${episode}`
    };
  },

  // Helper for Images
  getImageUrl: (path: string, size = 'w500') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder.svg';
  }
};
