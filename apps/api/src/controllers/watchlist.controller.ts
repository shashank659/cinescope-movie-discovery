import type { Request, Response, NextFunction } from 'express';
import * as userListService from '../services/userList.service.js';

export async function getWatchlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const items = await userListService.getUserWatchlist(userId);
    res.status(200).json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

export async function addToWatchlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { movieId, movieTitle, posterPath, releaseDate } = req.body;
    const item = await userListService.addMovieToWatchlist(userId, {
      movieId,
      movieTitle,
      posterPath,
      releaseDate,
    });
    res.status(201).json({ success: true, data: { item } });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWatchlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const movieId = Number(req.params.movieId);
    await userListService.removeMovieFromWatchlist(userId, movieId);
    res.status(200).json({ success: true, data: { message: 'Movie removed from watchlist' } });
  } catch (err) {
    next(err);
  }
}

export async function checkWatchlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const movieId = Number(req.params.movieId);
    const isWatchlisted = await userListService.isMovieInWatchlist(userId, movieId);
    res.status(200).json({ success: true, data: { isWatchlisted } });
  } catch (err) {
    next(err);
  }
}
