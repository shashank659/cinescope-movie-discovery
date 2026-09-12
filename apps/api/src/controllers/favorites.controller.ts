import type { Request, Response, NextFunction } from 'express';
import * as userListService from '../services/userList.service.js';

export async function getFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const items = await userListService.getUserFavorites(userId);
    res.status(200).json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

export async function addToFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { movieId, movieTitle, posterPath, releaseDate } = req.body;
    const item = await userListService.addMovieToFavorites(userId, {
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

export async function removeFromFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const movieId = Number(req.params.movieId);
    await userListService.removeMovieFromFavorites(userId, movieId);
    res.status(200).json({ success: true, data: { message: 'Movie removed from favorites' } });
  } catch (err) {
    next(err);
  }
}

export async function checkFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const movieId = Number(req.params.movieId);
    const isFavorite = await userListService.isMovieInFavorites(userId, movieId);
    res.status(200).json({ success: true, data: { isFavorite } });
  } catch (err) {
    next(err);
  }
}
