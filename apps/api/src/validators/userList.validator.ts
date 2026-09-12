import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import type { AppError } from '../middlewares/error.middleware.js';

export const addMovieItemSchema = z.object({
  movieId: z.coerce.number().int().positive('Movie ID must be a valid positive integer'),
  movieTitle: z.string().trim().min(1, 'Movie title is required'),
  posterPath: z.string().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
});

export const moviePathParamSchema = z.object({
  movieId: z
    .string({ required_error: 'Movie ID is required' })
    .regex(/^\d+$/, 'Movie ID must be a valid positive integer')
    .transform(Number)
    .refine((n) => n > 0, 'Movie ID must be a valid positive integer'),
});

export function validateMovieParam(req: Request, _res: Response, next: NextFunction): void {
  const result = moviePathParamSchema.safeParse(req.params);
  if (!result.success) {
    const error: AppError = new Error(result.error.errors[0]?.message || 'Invalid movie ID parameter');
    error.statusCode = 400;
    return next(error);
  }
  req.params.movieId = String(result.data.movieId);
  next();
}
