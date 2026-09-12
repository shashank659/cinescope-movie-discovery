import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTmdbAuthHeaders, tmdbFetch } from '../services/tmdb.service.js';
import { env } from '../config/env.js';

describe('TMDB Service', () => {
  const originalToken = env.TMDB_API_READ_ACCESS_TOKEN;

  afterEach(() => {
    env.TMDB_API_READ_ACCESS_TOKEN = originalToken;
    vi.restoreAllMocks();
  });

  describe('getTmdbAuthHeaders', () => {
    it('should throw an error if TMDB_API_READ_ACCESS_TOKEN is missing or empty', () => {
      env.TMDB_API_READ_ACCESS_TOKEN = '';
      expect(() => getTmdbAuthHeaders()).toThrow(
        'TMDB_API_READ_ACCESS_TOKEN is not configured in backend environment variables'
      );
    });

    it('should format Authorization header as Bearer token', () => {
      env.TMDB_API_READ_ACCESS_TOKEN = 'test-token-123';
      const headers = getTmdbAuthHeaders();

      expect(headers.Authorization).toBe('Bearer test-token-123');
      expect(headers['Content-Type']).toBe('application/json;charset=utf-8');
      expect(headers.Accept).toBe('application/json');
    });
  });

  describe('tmdbFetch', () => {
    it('should call fetch with correct URL and Bearer Authorization header', async () => {
      env.TMDB_API_READ_ACCESS_TOKEN = 'mock-bearer-token';

      const mockResponse = { results: [] };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await tmdbFetch<{ results: unknown[] }>('/movie/popular', {
        params: { page: 1 },
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
      expect(calledUrl).toContain('https://api.themoviedb.org/3/movie/popular');
      expect(calledUrl).toContain('page=1');
      expect(calledOptions.headers.Authorization).toBe('Bearer mock-bearer-token');
    });

    it('should handle TMDB API error responses gracefully', async () => {
      env.TMDB_API_READ_ACCESS_TOKEN = 'mock-bearer-token';

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ status_message: 'Invalid API key: You must be granted a valid key.' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(tmdbFetch('/movie/popular')).rejects.toThrow(
        /TMDB service authentication failed/
      );
    });
  });
});
