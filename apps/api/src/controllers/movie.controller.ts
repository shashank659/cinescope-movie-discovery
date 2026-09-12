import type { Request, Response, NextFunction } from 'express';
import * as tmdbService from '../services/tmdb.service.js';

export async function getTrending(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, language } = req.query as unknown as { page?: number; language?: string };
    const data = await tmdbService.getTrendingMovies({ page, language });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getPopular(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, language, region } = req.query as unknown as {
      page?: number;
      language?: string;
      region?: string;
    };
    const data = await tmdbService.getPopularMovies({ page, language, region });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getTopRated(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, language, region } = req.query as unknown as {
      page?: number;
      language?: string;
      region?: string;
    };
    const data = await tmdbService.getTopRatedMovies({ page, language, region });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getNowPlaying(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, language, region } = req.query as unknown as {
      page?: number;
      language?: string;
      region?: string;
    };
    const data = await tmdbService.getNowPlayingMovies({ page, language, region });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getUpcoming(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, language, region } = req.query as unknown as {
      page?: number;
      language?: string;
      region?: string;
    };
    const data = await tmdbService.getUpcomingMovies({ page, language, region });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function search(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query, page, language, region } = req.query as unknown as {
      query: string;
      page?: number;
      language?: string;
      region?: string;
    };
    const data = await tmdbService.searchMovies({ query, page, language, region });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getGenres(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { language } = req.query as unknown as { language?: string };
    const data = await tmdbService.getMovieGenres({ language });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { language } = req.query as unknown as { language?: string };
    const data = await tmdbService.getMovieDetails(id, { language });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
