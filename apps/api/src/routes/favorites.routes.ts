import { Router } from 'express';
import * as favoritesController from '../controllers/favorites.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../validators/auth.validator.js';
import { addMovieItemSchema, validateMovieParam } from '../validators/userList.validator.js';

export const favoritesRouter = Router();

favoritesRouter.get('/', requireAuth, favoritesController.getFavorites);
favoritesRouter.post('/', requireAuth, validateBody(addMovieItemSchema), favoritesController.addToFavorites);
favoritesRouter.get('/:movieId/check', requireAuth, validateMovieParam, favoritesController.checkFavorites);
favoritesRouter.delete('/:movieId', requireAuth, validateMovieParam, favoritesController.removeFromFavorites);
