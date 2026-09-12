import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import type { AppError } from '../middlewares/error.middleware.js';

export const paginationQuerySchema = z.object({
  page: z.preprocess(
    (val) => (val === undefined ? 1 : Number(val)),
    z
      .number({ invalid_type_error: 'Page must be a positive integer' })
      .int('Page must be a positive integer')
      .positive('Page must be a positive integer')
  ).optional().default(1),
  language: z.string().trim().min(2, 'Language code must be at least 2 characters').optional(),
  region: z.string().trim().min(2, 'Region code must be at least 2 characters').optional(),
});

export const searchMovieQuerySchema = z.object({
  query: z
    .string({ required_error: 'Search query is required' })
    .trim()
    .min(1, 'Search query must not be empty'),
  page: z.preprocess(
    (val) => (val === undefined ? 1 : Number(val)),
    z
      .number({ invalid_type_error: 'Page must be a positive integer' })
      .int('Page must be a positive integer')
      .positive('Page must be a positive integer')
  ).optional().default(1),
  language: z.string().trim().min(2, 'Language code must be at least 2 characters').optional(),
  region: z.string().trim().min(2, 'Region code must be at least 2 characters').optional(),
});

export const movieIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Movie ID is required' })
    .regex(/^\d+$/, 'Movie ID must be a valid positive integer')
    .transform(Number)
    .refine((n) => n > 0, 'Movie ID must be a valid positive integer'),
});

export const genreQuerySchema = z.object({
  language: z.string().trim().min(2, 'Language code must be at least 2 characters').optional(),
});

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const firstError = result.error.errors[0]?.message || 'Invalid query parameters';
      const error: AppError = new Error(firstError);
      error.statusCode = 400;
      error.details = result.error.flatten().fieldErrors;
      return next(error);
    }
    req.query = result.data;
    next();
  };
}

export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const firstError = result.error.errors[0]?.message || 'Invalid route parameters';
      const error: AppError = new Error(firstError);
      error.statusCode = 400;
      error.details = result.error.flatten().fieldErrors;
      return next(error);
    }
    req.params = result.data;
    next();
  };
}
