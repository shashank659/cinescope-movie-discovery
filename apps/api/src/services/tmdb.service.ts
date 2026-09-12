import { env } from '../config/env.js';
import type { AppError } from '../middlewares/error.middleware.js';
import type {
  MovieSummary,
  MovieDetails,
  PaginatedResults,
  Genre,
  MovieGenresResponse,
} from '@cinescope/shared';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TmdbRequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

// Raw TMDB Response Interfaces
interface TmdbRawMovie {
  id: number;
  title: string;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  vote_average?: number | null;
  vote_count?: number | null;
  genre_ids?: number[] | null;
  popularity?: number | null;
}

interface TmdbRawPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TmdbRawMovieDetails extends TmdbRawMovie {
  tagline?: string | null;
  runtime?: number | null;
  genres?: Array<{ id: number; name: string }>;
  status?: string | null;
  budget?: number | null;
  revenue?: number | null;
}

interface TmdbRawGenreList {
  genres: Array<{ id: number; name: string }>;
}

/**
 * Returns authorization headers for TMDB API calls.
 * Throws an error if the TMDB_API_READ_ACCESS_TOKEN is missing.
 */
export function getTmdbAuthHeaders(): Record<string, string> {
  const token = env.TMDB_API_READ_ACCESS_TOKEN;

  if (!token) {
    const error: AppError = new Error(
      'TMDB_API_READ_ACCESS_TOKEN is not configured in backend environment variables'
    );
    error.statusCode = 500;
    throw error;
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json;charset=utf-8',
    Accept: 'application/json',
  };
}

/**
 * Helper to fetch data from TMDB API endpoints.
 * Authenticates requests using the TMDB_API_READ_ACCESS_TOKEN via the Authorization: Bearer <token> header.
 * Token is kept strictly within backend memory and never exposed to the client or logs.
 */
export async function tmdbFetch<T>(
  endpoint: string,
  options: TmdbRequestOptions = {}
): Promise<T> {
  const authHeaders = getTmdbAuthHeaders();

  // Construct URL with query parameters
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${TMDB_BASE_URL}${cleanEndpoint}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });
  } catch (networkErr) {
    const error: AppError = new Error('Failed to connect to TMDB service');
    error.statusCode = 502;
    error.details = (networkErr as Error).message;
    throw error;
  }

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = (await response.json()) as { status_message?: string };
      if (errorJson?.status_message) {
        errorDetail = errorJson.status_message;
      }
    } catch {
      // Fall back to statusText if response is not JSON
    }

    if (response.status === 401 || response.status === 403) {
      const error: AppError = new Error(`TMDB service authentication failed: ${errorDetail}`);
      error.statusCode = 502;
      throw error;
    }

    if (response.status === 404) {
      const error: AppError = new Error('Requested movie resource not found');
      error.statusCode = 404;
      throw error;
    }

    if (response.status === 429) {
      const error: AppError = new Error('TMDB API rate limit exceeded. Please try again later.');
      error.statusCode = 429;
      throw error;
    }

    if (response.status >= 500) {
      const error: AppError = new Error('TMDB upstream service error');
      error.statusCode = 502;
      throw error;
    }

    const error: AppError = new Error(`TMDB API error (${response.status}): ${errorDetail}`);
    error.statusCode = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}

/**
 * Normalizes raw TMDB movie data into a robust MovieSummary object with fallbacks.
 */
export function normalizeMovie(raw: TmdbRawMovie): MovieSummary {
  const posterPath = raw.poster_path || null;
  const backdropPath = raw.backdrop_path || null;
  const releaseDate = raw.release_date && raw.release_date.trim() !== '' ? raw.release_date : null;
  const voteAverage =
    typeof raw.vote_average === 'number' && !isNaN(raw.vote_average)
      ? Math.round(raw.vote_average * 10) / 10
      : 0;
  const voteCount = typeof raw.vote_count === 'number' ? raw.vote_count : 0;
  const genreIds = Array.isArray(raw.genre_ids) ? raw.genre_ids : [];

  return {
    id: raw.id,
    title: raw.title || 'Untitled',
    overview: raw.overview || '',
    posterPath,
    backdropPath,
    releaseDate,
    voteAverage,
    voteCount,
    genreIds,
    popularity: typeof raw.popularity === 'number' ? raw.popularity : 0,
    // Convenience aliases
    poster_path: posterPath,
    backdrop_path: backdropPath,
    release_date: releaseDate,
    vote_average: voteAverage,
    vote_count: voteCount,
    genre_ids: genreIds,
  };
}

/**
 * Normalizes raw TMDB movie details into a robust MovieDetails object with fallbacks.
 */
export function normalizeMovieDetails(raw: TmdbRawMovieDetails): MovieDetails {
  const base = normalizeMovie(raw);

  return {
    ...base,
    tagline: raw.tagline || null,
    runtime: typeof raw.runtime === 'number' && raw.runtime > 0 ? raw.runtime : null,
    genres: Array.isArray(raw.genres)
      ? raw.genres.map((g) => ({ id: g.id, name: g.name }))
      : [],
    status: raw.status || 'Released',
    budget: typeof raw.budget === 'number' ? raw.budget : 0,
    revenue: typeof raw.revenue === 'number' ? raw.revenue : 0,
  };
}

/**
 * Normalizes a raw TMDB paginated response.
 */
export function normalizePaginatedResponse(
  raw: TmdbRawPaginatedResponse<TmdbRawMovie>
): PaginatedResults<MovieSummary> {
  const page = raw.page || 1;
  const totalPages = raw.total_pages || 0;
  const totalResults = raw.total_results || 0;

  return {
    page,
    results: Array.isArray(raw.results) ? raw.results.map(normalizeMovie) : [],
    totalPages,
    totalResults,
    total_pages: totalPages,
    total_results: totalResults,
  };
}

// ==========================================
// Service Methods for CineScope API
// ==========================================

export async function getTrendingMovies(params?: {
  page?: number;
  language?: string;
}): Promise<PaginatedResults<MovieSummary>> {
  const raw = await tmdbFetch<TmdbRawPaginatedResponse<TmdbRawMovie>>('/trending/movie/week', {
    params: {
      page: params?.page || 1,
      language: params?.language,
    },
  });
  return normalizePaginatedResponse(raw);
}

export async function getPopularMovies(params?: {
  page?: number;
  language?: string;
  region?: string;
}): Promise<PaginatedResults<MovieSummary>> {
  const raw = await tmdbFetch<TmdbRawPaginatedResponse<TmdbRawMovie>>('/movie/popular', {
    params: {
      page: params?.page || 1,
      language: params?.language,
      region: params?.region,
    },
  });
  return normalizePaginatedResponse(raw);
}

export async function getTopRatedMovies(params?: {
  page?: number;
  language?: string;
  region?: string;
}): Promise<PaginatedResults<MovieSummary>> {
  const raw = await tmdbFetch<TmdbRawPaginatedResponse<TmdbRawMovie>>('/movie/top_rated', {
    params: {
      page: params?.page || 1,
      language: params?.language,
      region: params?.region,
    },
  });
  return normalizePaginatedResponse(raw);
}

export async function getNowPlayingMovies(params?: {
  page?: number;
  language?: string;
  region?: string;
}): Promise<PaginatedResults<MovieSummary>> {
  const raw = await tmdbFetch<TmdbRawPaginatedResponse<TmdbRawMovie>>('/movie/now_playing', {
    params: {
      page: params?.page || 1,
      language: params?.language,
      region: params?.region,
    },
  });
  return normalizePaginatedResponse(raw);
}

export async function getUpcomingMovies(params?: {
  page?: number;
  language?: string;
  region?: string;
}): Promise<PaginatedResults<MovieSummary>> {
  const raw = await tmdbFetch<TmdbRawPaginatedResponse<TmdbRawMovie>>('/movie/upcoming', {
    params: {
      page: params?.page || 1,
      language: params?.language,
      region: params?.region,
    },
  });
  return normalizePaginatedResponse(raw);
}

export async function searchMovies(params: {
  query: string;
  page?: number;
  language?: string;
  region?: string;
}): Promise<PaginatedResults<MovieSummary>> {
  const raw = await tmdbFetch<TmdbRawPaginatedResponse<TmdbRawMovie>>('/search/movie', {
    params: {
      query: params.query,
      page: params.page || 1,
      language: params.language,
      region: params.region,
    },
  });
  return normalizePaginatedResponse(raw);
}

export async function getMovieDetails(
  movieId: number,
  params?: { language?: string }
): Promise<MovieDetails> {
  const raw = await tmdbFetch<TmdbRawMovieDetails>(`/movie/${movieId}`, {
    params: {
      language: params?.language,
    },
  });
  return normalizeMovieDetails(raw);
}

export async function getMovieGenres(params?: {
  language?: string;
}): Promise<MovieGenresResponse> {
  const raw = await tmdbFetch<TmdbRawGenreList>('/genre/movie/list', {
    params: {
      language: params?.language,
    },
  });
  return {
    genres: Array.isArray(raw.genres)
      ? raw.genres.map((g) => ({ id: g.id, name: g.name }))
      : [],
  };
}
