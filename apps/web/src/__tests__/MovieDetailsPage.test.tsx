import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovieDetailsPage } from '../pages/MovieDetailsPage';
import * as movieApi from '../services/movieApi';
import type { MovieDetails } from '@cinescope/shared';

vi.mock('../services/movieApi', () => ({
  getMovieDetails: vi.fn(),
  getPosterUrl: vi.fn((path) => (path ? `https://image.tmdb.org/t/p/w500${path}` : null)),
  getBackdropUrl: vi.fn((path) => (path ? `https://image.tmdb.org/t/p/w1280${path}` : null)),
  formatReleaseYear: vi.fn((date) => (date ? date.split('-')[0] : 'N/A')),
  formatRuntime: vi.fn((min) => (min ? `${Math.floor(min / 60)}h ${min % 60}m` : 'N/A')),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('../services/userListApi', () => ({
  checkWatchlist: vi.fn().mockResolvedValue(false),
  checkFavorite: vi.fn().mockResolvedValue(false),
  addToWatchlist: vi.fn().mockResolvedValue({}),
  removeFromWatchlist: vi.fn().mockResolvedValue(undefined),
  addToFavorites: vi.fn().mockResolvedValue({}),
  removeFromFavorites: vi.fn().mockResolvedValue(undefined),
}));

const mockDetails: MovieDetails = {
  id: 501,
  title: 'Interstellar',
  overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
  tagline: 'Mankind was born on Earth. It was never meant to die here.',
  posterPath: '/interstellar.jpg',
  backdropPath: '/interstellar_bg.jpg',
  releaseDate: '2014-11-05',
  voteAverage: 8.6,
  voteCount: 32000,
  runtime: 169,
  genres: [
    { id: 12, name: 'Adventure' },
    { id: 18, name: 'Drama' },
    { id: 878, name: 'Science Fiction' },
  ],
  status: 'Released',
  budget: 165000000,
  revenue: 701729206,
};

describe('MovieDetailsPage Component', () => {
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

  it('renders movie details correctly when loaded', async () => {
    vi.mocked(movieApi.getMovieDetails).mockResolvedValueOnce(mockDetails);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/movie/501']}>
          <Routes>
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Interstellar')).toBeInTheDocument();
    expect(screen.getByText(/"Mankind was born on Earth. It was never meant to die here."/i)).toBeInTheDocument();
    expect(screen.getByText('Adventure')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    expect(screen.getByText('2h 49m')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to (watchlist|wishlist)/i })).toBeInTheDocument();
  });

  it('renders invalid movie error when ID in route is non-numeric', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/movie/invalid-id']}>
          <Routes>
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Invalid Movie')).toBeInTheDocument();
    expect(screen.getByText('The requested movie ID is not valid.')).toBeInTheDocument();
  });

  it('renders error state when API request fails', async () => {
    vi.mocked(movieApi.getMovieDetails).mockRejectedValueOnce(new Error('Movie not found on TMDB'));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/movie/999999']}>
          <Routes>
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Could not load movie details')).toBeInTheDocument();
    expect(screen.getByText('Movie not found on TMDB')).toBeInTheDocument();
  });
});
