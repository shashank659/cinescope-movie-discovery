import type {
  MovieSummary,
  MovieDetails,
  PaginatedResults,
  MovieGenresResponse,
  ApiResponse,
} from '@cinescope/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Constructs a full TMDB image URL for movie posters.
 * Falls back to null if posterPath is missing.
 */
export function getPosterUrl(path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string | null {
  if (!path || path.trim() === '') return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Constructs a full TMDB image URL for movie backdrops.
 * Falls back to null if backdropPath is missing.
 */
export function getBackdropUrl(path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
  if (!path || path.trim() === '') return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Formats runtime minutes into a readable hours and minutes string (e.g. 148 -> "2h 28m").
 */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats a release date string (YYYY-MM-DD) to a 4-digit release year (e.g. "2010").
 */
export function formatReleaseYear(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr.trim() === '') return 'N/A';
  const year = dateStr.split('-')[0];
  return year && year.length === 4 ? year : 'N/A';
}

/**
 * Internal generic request handler calling the CineScope Express API backend.
 * Never calls TMDB directly.
 */
async function fetchFromBackend<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${window.location.origin}${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success || !body.data) {
    const errorMessage = body?.error?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return body.data;
}

export async function getTrendingMovies(page = 1): Promise<PaginatedResults<MovieSummary>> {
  return fetchFromBackend<PaginatedResults<MovieSummary>>('/movies/trending', { page });
}

export async function getPopularMovies(page = 1): Promise<PaginatedResults<MovieSummary>> {
  return fetchFromBackend<PaginatedResults<MovieSummary>>('/movies/popular', { page });
}

export async function getTopRatedMovies(page = 1): Promise<PaginatedResults<MovieSummary>> {
  return fetchFromBackend<PaginatedResults<MovieSummary>>('/movies/top-rated', { page });
}

export async function getNowPlayingMovies(page = 1): Promise<PaginatedResults<MovieSummary>> {
  return fetchFromBackend<PaginatedResults<MovieSummary>>('/movies/now-playing', { page });
}

export async function getUpcomingMovies(page = 1): Promise<PaginatedResults<MovieSummary>> {
  return fetchFromBackend<PaginatedResults<MovieSummary>>('/movies/upcoming', { page });
}

export async function searchMovies(query: string, page = 1): Promise<PaginatedResults<MovieSummary>> {
  return fetchFromBackend<PaginatedResults<MovieSummary>>('/movies/search', { query, page });
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  return fetchFromBackend<MovieDetails>(`/movies/${id}`);
}

export async function getMovieGenres(): Promise<MovieGenresResponse> {
  return fetchFromBackend<MovieGenresResponse>('/movies/genres');
}
