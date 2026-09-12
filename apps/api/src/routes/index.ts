import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { movieRouter } from './movie.routes.js';
import { authRouter } from './auth.routes.js';
import { watchlistRouter } from './watchlist.routes.js';
import { favoritesRouter } from './favorites.routes.js';

export const apiRouter = Router();

apiRouter.use('/', healthRouter);
apiRouter.use('/movies', movieRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/watchlist', watchlistRouter);
apiRouter.use('/favorites', favoritesRouter);
