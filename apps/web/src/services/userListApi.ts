import type { WatchlistItem, FavoriteItem, ApiResponse } from '@cinescope/shared';
import { getAuthHeaders } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// ==========================================
// Watchlist Client Methods
// ==========================================

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const res = await fetch(`${API_BASE_URL}/watchlist`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<{ items: WatchlistItem[] }>;
  if (!res.ok || !body.success || !body.data) {
    throw new Error(body?.error?.message || 'Failed to fetch watchlist');
  }

  return body.data.items;
}

export async function addToWatchlist(item: {
  movieId: number;
  movieTitle: string;
  posterPath?: string | null;
  releaseDate?: string | null;
}): Promise<WatchlistItem> {
  const res = await fetch(`${API_BASE_URL}/watchlist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<{ item: WatchlistItem }>;
  if (!res.ok || !body.success || !body.data) {
    throw new Error(body?.error?.message || 'Failed to add to watchlist');
  }

  return body.data.item;
}

export async function removeFromWatchlist(movieId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/watchlist/${movieId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<{ message: string }>;
  if (!res.ok || !body.success) {
    throw new Error(body?.error?.message || 'Failed to remove from watchlist');
  }
}

export async function checkWatchlist(movieId: number): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/watchlist/${movieId}/check`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<{ isWatchlisted: boolean }>;
  if (!res.ok || !body.success || !body.data) {
    return false;
  }

  return body.data.isWatchlisted;
}

// ==========================================
// Favorites Client Methods
// ==========================================

export async function fetchFavorites(): Promise<FavoriteItem[]> {
  const res = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<{ items: FavoriteItem[] }>;
  if (!res.ok || !body.success || !body.data) {
    throw new Error(body?.error?.message || 'Failed to fetch favorites');
  }

  return body.data.items;
}

export async function addToFavorites(item: {
  movieId: number;
  movieTitle: string;
  posterPath?: string | null;
  releaseDate?: string | null;
}): Promise<FavoriteItem> {
  const res = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<{ item: FavoriteItem }>;
  if (!res.ok || !body.success || !body.data) {
    throw new Error(body?.error?.message || 'Failed to add to favorites');
  }

  return body.data.item;
}

export async function removeFromFavorites(movieId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/favorites/${movieId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<{ message: string }>;
  if (!res.ok || !body.success) {
    throw new Error(body?.error?.message || 'Failed to remove from favorites');
  }
}

export async function checkFavorite(movieId: number): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/favorites/${movieId}/check`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<{ isFavorite: boolean }>;
  if (!res.ok || !body.success || !body.data) {
    return false;
  }

  return body.data.isFavorite;
}
