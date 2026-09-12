import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { env } from '../config/env.js';

describe('Movies API (/api/movies)', () => {
  const originalToken = env.TMDB_API_READ_ACCESS_TOKEN;

  const mockTmdbMovie = {
    id: 101,
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through dream-sharing technology.',
    poster_path: '/inception.jpg',
    backdrop_path: '/inception_bg.jpg',
    release_date: '2010-07-15',
    vote_average: 8.36,
    vote_count: 35000,
    genre_ids: [28, 878],
    popularity: 120.5,
  };

  const mockPaginatedResponse = {
    page: 1,
    results: [mockTmdbMovie],
    total_pages: 50,
    total_results: 1000,
  };

  const mockGenresResponse = {
    genres: [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Science Fiction' },
    ],
  };

  const mockMovieDetailsResponse = {
    ...mockTmdbMovie,
    tagline: 'Your mind is the scene of the crime.',
    runtime: 148,
    genres: [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Science Fiction' },
    ],
    status: 'Released',
    budget: 160000000,
    revenue: 836800000,
  };

  beforeEach(() => {
    env.TMDB_API_READ_ACCESS_TOKEN = 'test-token';
  });

  afterEach(() => {
    env.TMDB_API_READ_ACCESS_TOKEN = originalToken;
    vi.restoreAllMocks();
  });

  describe('GET /api/movies/trending', () => {
    it('should return trending movies with 200 OK and normalized data', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockPaginatedResponse,
        })
      );

      const response = await request(app).get('/api/movies/trending?page=1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.results).toHaveLength(1);
      expect(response.body.data.results[0].title).toBe('Inception');
      expect(response.body.data.results[0].voteAverage).toBe(8.4);
      expect(response.body.data.totalPages).toBe(50);
    });
  });

  describe('GET /api/movies/popular', () => {
    it('should return popular movies with 200 OK', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockPaginatedResponse,
        })
      );

      const response = await request(app).get('/api/movies/popular');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results[0].id).toBe(101);
    });
  });

  describe('GET /api/movies/top-rated', () => {
    it('should return top-rated movies with 200 OK', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockPaginatedResponse,
        })
      );

      const response = await request(app).get('/api/movies/top-rated');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(1);
    });
  });

  describe('GET /api/movies/now-playing', () => {
    it('should return now-playing movies with 200 OK', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockPaginatedResponse,
        })
      );

      const response = await request(app).get('/api/movies/now-playing');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(1);
    });
  });

  describe('GET /api/movies/upcoming', () => {
    it('should return upcoming movies with 200 OK', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockPaginatedResponse,
        })
      );

      const response = await request(app).get('/api/movies/upcoming');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(1);
    });
  });

  describe('GET /api/movies/search', () => {
    it('should return search results for a valid query', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockPaginatedResponse,
        })
      );

      const response = await request(app).get('/api/movies/search?query=batman');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results[0].title).toBe('Inception');
    });

    it('should return 400 Bad Request when search query is empty', async () => {
      const response = await request(app).get('/api/movies/search?query=');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/Search query must not be empty/i);
    });

    it('should return 400 Bad Request when search query parameter is missing', async () => {
      const response = await request(app).get('/api/movies/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/Search query is required/i);
    });
  });

  describe('GET /api/movies/genres', () => {
    it('should return genre list with 200 OK', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockGenresResponse,
        })
      );

      const response = await request(app).get('/api/movies/genres');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.genres).toHaveLength(2);
      expect(response.body.data.genres[0]).toEqual({ id: 28, name: 'Action' });
    });
  });

  describe('GET /api/movies/:id', () => {
    it('should return movie details for a valid ID', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockMovieDetailsResponse,
        })
      );

      const response = await request(app).get('/api/movies/101');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(101);
      expect(response.body.data.runtime).toBe(148);
      expect(response.body.data.tagline).toBe('Your mind is the scene of the crime.');
    });

    it('should return 400 Bad Request for an invalid movie ID (string/negative)', async () => {
      const response = await request(app).get('/api/movies/not-a-number');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/Movie ID must be a valid positive integer/i);
    });

    it('should return 404 Not Found when movie does not exist on TMDB', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({ status_message: 'The resource you requested could not be found.' }),
        })
      );

      const response = await request(app).get('/api/movies/999999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/Requested movie resource not found/i);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should return 500 when TMDB token is missing', async () => {
      env.TMDB_API_READ_ACCESS_TOKEN = '';

      const response = await request(app).get('/api/movies/trending');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('TMDB_API_READ_ACCESS_TOKEN is not configured');
    });

    it('should return 502 when TMDB service experiences network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline / connection timeout')));

      const response = await request(app).get('/api/movies/popular');

      expect(response.status).toBe(502);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Failed to connect to TMDB service');
    });

    it('should return 502 when TMDB upstream returns 500', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ status_message: 'Internal error' }),
        })
      );

      const response = await request(app).get('/api/movies/top-rated');

      expect(response.status).toBe(502);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('TMDB upstream service error');
    });

    it('should handle pagination query parameter validation errors', async () => {
      const response = await request(app).get('/api/movies/popular?page=-1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/Page must be a positive integer/i);
    });
  });
});
