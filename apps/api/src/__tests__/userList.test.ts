import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/prisma.js';

describe('Watchlist and Favorites API', () => {
  let tokenA: string;
  let tokenB: string;

  const userA = {
    name: 'User A',
    email: 'usera.list@example.com',
    password: 'password123',
  };

  const userB = {
    name: 'User B',
    email: 'userb.list@example.com',
    password: 'password123',
  };

  const movieItem = {
    movieId: 550,
    movieTitle: 'Fight Club',
    posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    releaseDate: '1999-10-15',
  };

  beforeAll(async () => {
    // Cleanup prior runs
    await prisma.user.deleteMany({
      where: { email: { in: [userA.email.toLowerCase(), userB.email.toLowerCase()] } },
    });

    const regA = await request(app).post('/api/auth/register').send(userA);
    const cookieA = regA.headers['set-cookie'];
    const matchA = cookieA && cookieA[0] ? cookieA[0].match(/token=([^;]+)/) : null;
    tokenA = matchA ? matchA[1] : '';

    const regB = await request(app).post('/api/auth/register').send(userB);
    const cookieB = regB.headers['set-cookie'];
    const matchB = cookieB && cookieB[0] ? cookieB[0].match(/token=([^;]+)/) : null;
    tokenB = matchB ? matchB[1] : '';
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [userA.email, userB.email] } },
    });
    await prisma.$disconnect();
  });

  describe('Watchlist Operations', () => {
    it('allows User A to add a movie to watchlist and verifies user isolation', async () => {
      const res = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(movieItem);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.movieId).toBe(movieItem.movieId);

      // User A check
      const checkA = await request(app)
        .get(`/api/watchlist/${movieItem.movieId}/check`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkA.body.data.isWatchlisted).toBe(true);

      // User B check (should be false - user isolation)
      const checkB = await request(app)
        .get(`/api/watchlist/${movieItem.movieId}/check`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(checkB.body.data.isWatchlisted).toBe(false);
    });

    it('prevents adding duplicate movies to watchlist with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(movieItem);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already in your watchlist');
    });

    it('allows User A to remove the movie from watchlist', async () => {
      const res = await request(app)
        .delete(`/api/watchlist/${movieItem.movieId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkA = await request(app)
        .get(`/api/watchlist/${movieItem.movieId}/check`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkA.body.data.isWatchlisted).toBe(false);
    });
  });

  describe('Favorites Operations', () => {
    it('allows User A to add a movie to favorites', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(movieItem);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.movieId).toBe(movieItem.movieId);

      const checkA = await request(app)
        .get(`/api/favorites/${movieItem.movieId}/check`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkA.body.data.isFavorite).toBe(true);

      // User B should not see it
      const listB = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(listB.body.data.items).toHaveLength(0);
    });

    it('prevents adding duplicate favorites with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(movieItem);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('allows User A to remove a movie from favorites', async () => {
      const res = await request(app)
        .delete(`/api/favorites/${movieItem.movieId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkA = await request(app)
        .get(`/api/favorites/${movieItem.movieId}/check`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkA.body.data.isFavorite).toBe(false);
    });
  });

  describe('Security and Validation', () => {
    it('rejects unauthenticated access to watchlist with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/watchlist');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Authentication required/i);
    });

    it('rejects unauthenticated access to favorites with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/favorites');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Authentication required/i);
    });

    it('rejects non-numeric movieId route parameter with 400 Bad Request', async () => {
      const res = await request(app)
        .delete('/api/watchlist/invalid-movie-id')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/valid positive integer/i);
    });

    it('rejects invalid payload body on addToWatchlist with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          // missing movieTitle
          movieId: 550,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
