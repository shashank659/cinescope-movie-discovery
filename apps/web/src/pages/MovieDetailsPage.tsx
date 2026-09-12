import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Bookmark,
  Heart,
  DollarSign,
  Film,
  Check,
} from 'lucide-react';
import {
  getMovieDetails,
  getPosterUrl,
  getBackdropUrl,
  formatRuntime,
  formatReleaseYear,
} from '../services/movieApi';
import {
  checkWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkFavorite,
  addToFavorites,
  removeFromFavorites,
} from '../services/userListApi';
import { useAuth } from '../context/AuthContext';
import { PosterFallback } from '../components/PosterFallback';
import { ErrorState } from '../components/ErrorState';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);

  const movieId = Number(id);
  const isValidId = !isNaN(movieId) && movieId > 0;

  const {
    data: movie,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['movies', 'details', movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: isValidId,
  });

  // Watchlist status query
  const { data: isWatchlisted } = useQuery({
    queryKey: ['watchlist', 'check', movieId],
    queryFn: () => checkWatchlist(movieId),
    enabled: isValidId && !!user,
  });

  // Favorite status query
  const { data: isFavorite } = useQuery({
    queryKey: ['favorites', 'check', movieId],
    queryFn: () => checkFavorite(movieId),
    enabled: isValidId && !!user,
  });

  // Watchlist toggle mutation
  const watchlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate('/login', { state: { from: location } });
        return;
      }
      if (!movie) return;

      if (isWatchlisted) {
        await removeFromWatchlist(movieId);
      } else {
        await addToWatchlist({
          movieId: movie.id,
          movieTitle: movie.title,
          posterPath: movie.posterPath || movie.poster_path,
          releaseDate: movie.releaseDate || movie.release_date,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist', 'check', movieId] });
    },
  });

  // Favorite toggle mutation
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate('/login', { state: { from: location } });
        return;
      }
      if (!movie) return;

      if (isFavorite) {
        await removeFromFavorites(movieId);
      } else {
        await addToFavorites({
          movieId: movie.id,
          movieTitle: movie.title,
          posterPath: movie.posterPath || movie.poster_path,
          releaseDate: movie.releaseDate || movie.release_date,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check', movieId] });
    },
  });

  if (!isValidId) {
    return (
      <div className="py-16">
        <ErrorState
          title="Invalid Movie"
          message="The requested movie ID is not valid."
          onRetry={() => navigate('/')}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse pb-16" data-testid="details-loading">
        <div className="h-8 bg-neutral-900 rounded w-32" />
        <div className="relative h-[350px] sm:h-[450px] rounded-2xl bg-neutral-900 overflow-hidden" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="w-full aspect-[2/3] bg-neutral-900 rounded-xl" />
          <div className="md:col-span-2 space-y-4">
            <div className="h-10 bg-neutral-900 rounded w-3/4" />
            <div className="h-5 bg-neutral-900 rounded w-1/2" />
            <div className="h-24 bg-neutral-900 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="py-16">
        <ErrorState
          title="Could not load movie details"
          message={(error as Error)?.message || 'Movie not found.'}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-purple-400 hover:text-purple-300 transition underline"
          >
            &larr; Return to Discover
          </button>
        </div>
      </div>
    );
  }

  const posterUrl = getPosterUrl(movie.posterPath || movie.poster_path, 'w500');
  const backdropUrl = getBackdropUrl(movie.backdropPath || movie.backdrop_path, 'w1280');
  const releaseYear = formatReleaseYear(movie.releaseDate || movie.release_date);
  const runtimeFormatted = formatRuntime(movie.runtime);
  const rating = movie.voteAverage || movie.vote_average || 0;
  const voteCount = (movie.voteCount || movie.vote_count || 0).toLocaleString();

  const formatCurrency = (val?: number) => {
    if (!val || val <= 0) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 pb-16" data-testid="movie-details-page">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-sm text-neutral-400 hover:text-white transition group py-1"
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to browse</span>
      </button>

      {/* Main Details Presentation */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 shadow-2xl">
        {/* Backdrop Banner */}
        {backdropUrl && (
          <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
            <img
              src={backdropUrl}
              alt={`${movie.title} backdrop`}
              className="w-full h-full object-cover object-center opacity-40 filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
          </div>
        )}

        {/* Foreground Content Card */}
        <div className={`px-6 sm:px-10 pb-10 ${backdropUrl ? '-mt-32 sm:-mt-48 relative z-10' : 'pt-10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Poster Column */}
            <div className="md:col-span-4 lg:col-span-3 max-w-[280px] mx-auto md:mx-0 w-full">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-neutral-950 border-2 border-neutral-800 shadow-2xl">
                {posterUrl && !imageError ? (
                  <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PosterFallback title={movie.title} />
                )}
              </div>

              {/* Action Buttons: Watchlist & Favorite */}
              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={() => watchlistMutation.mutate()}
                  disabled={watchlistMutation.isPending}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-sm transition shadow-lg active:scale-98 disabled:opacity-50 ${
                    isWatchlisted
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/40'
                  }`}
                  aria-label={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  {isWatchlisted ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>In Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-medium text-sm transition border active:scale-98 disabled:opacity-50 ${
                    isFavorite
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-neutral-800/90 text-neutral-300 border-neutral-750 hover:bg-neutral-800 hover:text-white'
                  }`}
                  aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-400' : ''}`} />
                  <span>{isFavorite ? 'In Favorites' : 'Favorite'}</span>
                </button>
              </div>
            </div>

            {/* Info Column */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
              {/* Title & Tagline */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="mt-2 text-base text-purple-300/80 italic">
                    &quot;{movie.tagline}&quot;
                  </p>
                )}
              </div>

              {/* Meta Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{rating > 0 ? rating.toFixed(1) : 'NR'}</span>
                  <span className="text-neutral-500 text-xs font-normal">({voteCount} votes)</span>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-neutral-300">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{movie.releaseDate || movie.release_date || releaseYear}</span>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-neutral-300">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{runtimeFormatted}</span>
                </div>

                {movie.status && (
                  <div className="px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-neutral-400 text-xs">
                    {movie.status}
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-neutral-800 text-purple-300 border border-neutral-700/80"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Overview
                </h3>
                <p className="text-neutral-200 text-sm sm:text-base leading-relaxed">
                  {movie.overview || 'No synopsis is available for this film.'}
                </p>
              </div>

              {/* Financial Stats */}
              {(formatCurrency(movie.budget) || formatCurrency(movie.revenue)) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800/80 max-w-md">
                  {formatCurrency(movie.budget) && (
                    <div className="space-y-1">
                      <span className="text-xs text-neutral-400 uppercase tracking-wide flex items-center space-x-1">
                        <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Budget</span>
                      </span>
                      <p className="text-sm font-semibold text-neutral-200">
                        {formatCurrency(movie.budget)}
                      </p>
                    </div>
                  )}
                  {formatCurrency(movie.revenue) && (
                    <div className="space-y-1">
                      <span className="text-xs text-neutral-400 uppercase tracking-wide flex items-center space-x-1">
                        <Film className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Revenue</span>
                      </span>
                      <p className="text-sm font-semibold text-neutral-200">
                        {formatCurrency(movie.revenue)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
