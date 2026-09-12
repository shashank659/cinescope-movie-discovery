import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FavoritesPage } from '../pages/FavoritesPage';
import * as userListApi from '../services/userListApi';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../services/userListApi', () => ({
  fetchFavorites: vi.fn(),
  removeFromFavorites: vi.fn(),
}));

describe('FavoritesPage Component', () => {
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
          <FavoritesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Save Your Favorite Movies')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders favorite items when user is authenticated', async () => {
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

    vi.mocked(userListApi.fetchFavorites).mockResolvedValueOnce([
      {
        id: 'f1',
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
          <FavoritesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Fight Club')).toBeInTheDocument();
    expect(screen.getByText('1999')).toBeInTheDocument();
  });

  it('renders empty state when authenticated user has no favorite movies', async () => {
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

    vi.mocked(userListApi.fetchFavorites).mockResolvedValueOnce([]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <FavoritesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('No favorite movies yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /discover movies/i })).toBeInTheDocument();
  });
});
