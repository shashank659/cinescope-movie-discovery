import { Router } from 'express';
import * as watchlistController from '../controllers/watchlist.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../validators/auth.validator.js';
import { addMovieItemSchema, validateMovieParam } from '../validators/userList.validator.js';

export const watchlistRouter = Router();

watchlistRouter.get('/', requireAuth, watchlistController.getWatchlist);
watchlistRouter.post('/', requireAuth, validateBody(addMovieItemSchema), watchlistController.addToWatchlist);
watchlistRouter.get('/:movieId/check', requireAuth, validateMovieParam, watchlistController.checkWatchlist);
watchlistRouter.delete('/:movieId', requireAuth, validateMovieParam, watchlistController.removeFromWatchlist);
