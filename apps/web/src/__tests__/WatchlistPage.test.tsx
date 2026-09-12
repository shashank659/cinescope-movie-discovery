import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WatchlistPage } from '../pages/WatchlistPage';
import * as userListApi from '../services/userListApi';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../services/userListApi', () => ({
  fetchWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
}));

describe('WatchlistPage Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('renders unauthenticated prompt when user is not logged in', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WatchlistPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Track Your Watchlist')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders watchlist items when user is authenticated', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        email: 'user@example.com',
        name: 'Jane',
        createdAt: new Date().toISOString(),
      },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(userListApi.fetchWatchlist).mockResolvedValueOnce([
      {
        id: 'w1',
        userId: 'u1',
        movieId: 550,
        movieTitle: 'Fight Club',
        posterPath: '/fightclub.jpg',
        releaseDate: '1999-10-15',
        createdAt: new Date().toISOString(),
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WatchlistPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Fight Club')).toBeInTheDocument();
    expect(screen.getByText('1999')).toBeInTheDocument();
  });

  it('renders empty state when authenticated user has no movies in watchlist', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        email: 'user@example.com',
        name: 'Jane',
        createdAt: new Date().toISOString(),
      },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(userListApi.fetchWatchlist).mockResolvedValueOnce([]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WatchlistPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Your watchlist is empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /discover movies/i })).toBeInTheDocument();
  });
});
