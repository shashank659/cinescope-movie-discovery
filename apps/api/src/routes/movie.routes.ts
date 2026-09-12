import { Router } from 'express';
import * as movieController from '../controllers/movie.controller.js';
import {
  paginationQuerySchema,
  searchMovieQuerySchema,
  movieIdParamSchema,
  genreQuerySchema,
  validateQuery,
  validateParams,
} from '../validators/movie.validator.js';

export const movieRouter = Router();

// Named discovery routes (registered before parameterized route /:id)
movieRouter.get('/trending', validateQuery(paginationQuerySchema), movieController.getTrending);
movieRouter.get('/popular', validateQuery(paginationQuerySchema), movieController.getPopular);
movieRouter.get('/top-rated', validateQuery(paginationQuerySchema), movieController.getTopRated);
movieRouter.get('/now-playing', validateQuery(paginationQuerySchema), movieController.getNowPlaying);
movieRouter.get('/upcoming', validateQuery(paginationQuerySchema), movieController.getUpcoming);
movieRouter.get('/search', validateQuery(searchMovieQuerySchema), movieController.search);
movieRouter.get('/genres', validateQuery(genreQuerySchema), movieController.getGenres);

// Movie by ID (parameterized route registered last to prevent collisions)
movieRouter.get('/:id', validateParams(movieIdParamSchema), movieController.getById);
