import { prisma } from '../config/prisma.js';
import type { AppError } from '../middlewares/error.middleware.js';
import type { WatchlistItem, FavoriteItem } from '@cinescope/shared';

// ==========================================
// Watchlist Service Methods
// ==========================================

export async function getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
  const items = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    userId: item.userId,
    movieId: item.movieId,
    movieTitle: item.movieTitle,
    posterPath: item.posterPath,
    releaseDate: item.releaseDate,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function addMovieToWatchlist(
  userId: string,
  data: {
    movieId: number;
    movieTitle: string;
    posterPath?: string | null;
    releaseDate?: string | null;
  }
): Promise<WatchlistItem> {
  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: data.movieId,
      },
    },
  });

  if (existing) {
    const error: AppError = new Error('Movie is already in your watchlist');
    error.statusCode = 409;
    throw error;
  }

  const created = await prisma.watchlist.create({
    data: {
      userId,
      movieId: data.movieId,
      movieTitle: data.movieTitle.trim(),
      posterPath: data.posterPath || null,
      releaseDate: data.releaseDate || null,
    },
  });

  return {
    id: created.id,
    userId: created.userId,
    movieId: created.movieId,
    movieTitle: created.movieTitle,
    posterPath: created.posterPath,
    releaseDate: created.releaseDate,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function removeMovieFromWatchlist(
  userId: string,
  movieId: number
): Promise<void> {
  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
  });

  if (!existing) {
    const error: AppError = new Error('Movie not found in your watchlist');
    error.statusCode = 404;
    throw error;
  }

  await prisma.watchlist.delete({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
  });
}

export async function isMovieInWatchlist(
  userId: string,
  movieId: number
): Promise<boolean> {
  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
  });
  return Boolean(existing);
}

// ==========================================
// Favorites Service Methods
// ==========================================

export async function getUserFavorites(userId: string): Promise<FavoriteItem[]> {
  const items = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    userId: item.userId,
    movieId: item.movieId,
    movieTitle: item.movieTitle,
    posterPath: item.posterPath,
    releaseDate: item.releaseDate,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function addMovieToFavorites(
  userId: string,
  data: {
    movieId: number;
    movieTitle: string;
    posterPath?: string | null;
    releaseDate?: string | null;
  }
): Promise<FavoriteItem> {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: data.movieId,
      },
    },
  });

  if (existing) {
    const error: AppError = new Error('Movie is already in your favorites');
    error.statusCode = 409;
    throw error;
  }

  const created = await prisma.favorite.create({
    data: {
      userId,
      movieId: data.movieId,
      movieTitle: data.movieTitle.trim(),
      posterPath: data.posterPath || null,
      releaseDate: data.releaseDate || null,
    },
  });

  return {
    id: created.id,
    userId: created.userId,
    movieId: created.movieId,
    movieTitle: created.movieTitle,
    posterPath: created.posterPath,
    releaseDate: created.releaseDate,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function removeMovieFromFavorites(
  userId: string,
  movieId: number
): Promise<void> {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
  });

  if (!existing) {
    const error: AppError = new Error('Movie not found in your favorites');
    error.statusCode = 404;
    throw error;
  }

  await prisma.favorite.delete({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
  });
}

export async function isMovieInFavorites(
  userId: string,
  movieId: number
): Promise<boolean> {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
  });
  return Boolean(existing);
}
