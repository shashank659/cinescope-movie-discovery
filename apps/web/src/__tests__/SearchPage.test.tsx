import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchPage } from '../pages/SearchPage';
import * as movieApi from '../services/movieApi';

vi.mock('../services/movieApi', () => ({
  searchMovies: vi.fn(),
  getPosterUrl: vi.fn((path) => (path ? `https://image.tmdb.org/t/p/w500${path}` : null)),
  formatReleaseYear: vi.fn((date) => (date ? date.split('-')[0] : 'N/A')),
}));

describe('SearchPage Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('renders initial prompt when no query is present in URL', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/search']}>
          <SearchPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Start Searching')).toBeInTheDocument();
    expect(screen.getByText(/type a movie title in the search box/i)).toBeInTheDocument();
  });

  it('renders search results when query returns movies', async () => {
    vi.mocked(movieApi.searchMovies).mockResolvedValueOnce({
      page: 1,
      results: [
        {
          id: 201,
          title: 'The Dark Knight',
          overview: 'Batman raises the stakes in his war on crime.',
          posterPath: '/dark_knight.jpg',
          backdropPath: '/dark_knight_bg.jpg',
          releaseDate: '2008-07-18',
          voteAverage: 9.0,
          voteCount: 30000,
          genreIds: [28, 80],
          popularity: 150,
        },
      ],
      totalPages: 1,
      totalResults: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/search?q=batman']}>
          <SearchPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('The Dark Knight')).toBeInTheDocument();
    expect(screen.getByText(/1 movie found/i)).toBeInTheDocument();
  });

  it('renders empty state when search returns zero results', async () => {
    vi.mocked(movieApi.searchMovies).mockResolvedValueOnce({
      page: 1,
      results: [],
      totalPages: 0,
      totalResults: 0,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/search?q=nonexistentmoviexyz']}>
          <SearchPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('No movies found')).toBeInTheDocument();
  });

  it('renders error state when search request fails', async () => {
    vi.mocked(movieApi.searchMovies).mockRejectedValueOnce(new Error('Network error'));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/search?q=batman']}>
          <SearchPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Search failed')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });
});
