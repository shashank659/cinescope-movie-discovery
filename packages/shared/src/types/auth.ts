export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  releaseDate: string | null;
  createdAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  releaseDate: string | null;
  createdAt: string;
}
