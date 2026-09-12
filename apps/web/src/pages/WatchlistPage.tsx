import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, LogIn, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchWatchlist, removeFromWatchlist } from '../services/userListApi';
import { SavedMovieCard } from '../components/SavedMovieCard';
import { MovieCardSkeleton } from '../components/MovieCardSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export const WatchlistPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: items,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (movieId: number) => removeFromWatchlist(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  if (isAuthLoading) {
    return (
      <div className="py-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <MovieCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center" data-testid="watchlist-unauth">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Track Your Watchlist</h2>
          <p className="text-sm text-neutral-400">
            Sign in to save movies to your personal watchlist and access them anytime across devices.
          </p>
          <div className="pt-2 flex items-center justify-center space-x-3">
            <Link
              to="/login"
              state={{ from: { pathname: '/watchlist' } }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-sm font-medium border border-neutral-700 transition"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16" data-testid="watchlist-page">
      <div className="border-b border-neutral-800 pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Films you intend to watch next.
            </p>
          </div>
        </div>
        {items && (
          <span className="text-xs font-medium text-neutral-400">
            {items.length} {items.length === 1 ? 'movie' : 'movies'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, idx) => (
            <MovieCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load watchlist"
          message={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      ) : !items || items.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          message="Explore the catalog and save movies you want to watch later."
          action={
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition mt-2"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Movies</span>
            </Link>
          }
        />
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
          data-testid="watchlist-grid"
        >
          {items.map((item) => (
            <SavedMovieCard
              key={item.id}
              movieId={item.movieId}
              movieTitle={item.movieTitle}
              posterPath={item.posterPath}
              releaseDate={item.releaseDate}
              onRemove={(id) => removeMutation.mutateAsync(id)}
              removeLabel="Remove from watchlist"
            />
          ))}
        </div>
      )}
    </div>
  );
};
