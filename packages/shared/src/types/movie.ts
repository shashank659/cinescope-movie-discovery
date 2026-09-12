export interface Genre {
  id: number;
  name: string;
}

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  popularity: number;
  // Aliases for convenience
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
}

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  tagline: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
  runtime: number | null;
  genres: Genre[];
  status: string;
  budget: number;
  revenue: number;
  // Aliases for convenience
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  vote_average?: number;
  vote_count?: number;
}

export interface PaginatedResults<T> {
  page: number;
  results: T[];
  totalPages: number;
  totalResults: number;
  total_pages?: number;
  total_results?: number;
}

export interface MovieGenresResponse {
  genres: Genre[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: unknown;
  };
}
