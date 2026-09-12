import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Info, Calendar } from 'lucide-react';
import type { MovieSummary } from '@cinescope/shared';
import { getBackdropUrl, formatReleaseYear } from '../services/movieApi';

interface HeroBannerProps {
  movie?: MovieSummary;
  isLoading?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movie, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] lg:h-[450px] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 animate-pulse">
        <div className="absolute inset-0 bg-neutral-800/40" />
        <div className="absolute bottom-8 left-6 sm:left-10 max-w-xl space-y-3.5">
          <div className="h-6 bg-neutral-800 rounded w-1/4" />
          <div className="h-10 bg-neutral-800 rounded w-3/4" />
          <div className="h-4 bg-neutral-800 rounded w-full" />
          <div className="h-4 bg-neutral-800 rounded w-2/3" />
          <div className="h-10 bg-neutral-800 rounded w-36 pt-2" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="relative w-full h-[260px] sm:h-[320px] rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900 via-purple-950/20 to-neutral-900 border border-neutral-800 flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Explore Infinite Cinema</h1>
          <p className="text-neutral-400 text-xs sm:text-sm">
            Discover trending blockbusters, critically acclaimed gems, and upcoming cinematic releases.
          </p>
        </div>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdropPath || movie.backdrop_path);
  const releaseYear = formatReleaseYear(movie.releaseDate || movie.release_date);
  const rating = movie.voteAverage || movie.vote_average || 0;

  return (
    <div
      className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] lg:h-[450px] rounded-2xl overflow-hidden border border-neutral-800/90 shadow-2xl group select-none"
      data-testid="hero-banner"
    >
      {/* Background Backdrop */}
      {backdropUrl ? (
        <img
          src={backdropUrl}
          alt={`${movie.title} backdrop`}
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] sm:object-center transition-transform duration-1000 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-purple-950/30 to-neutral-900" />
      )}

      {/* Cinematic Dark Gradient Layers for Enhanced Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 via-45% to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/70 via-50% to-transparent max-w-xl md:max-w-2xl" />
      <div className="absolute inset-0 bg-neutral-950/15" />

      {/* Hero Content Overlay */}
      <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 left-5 sm:left-8 md:left-10 max-w-lg md:max-w-xl z-10 space-y-2.5 sm:space-y-3.5">
        {/* Featured Tag & Metas */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Featured Highlight
          </span>
          {rating > 0 && (
            <span className="flex items-center space-x-1 text-xs font-bold text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </span>
          )}
          {releaseYear !== 'N/A' && (
            <span className="flex items-center space-x-1 text-xs text-neutral-300/90 font-medium">
              <Calendar className="w-3 h-3 text-neutral-400" />
              <span>{releaseYear}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight line-clamp-2 drop-shadow-lg">
          {movie.title}
        </h1>

        {/* Overview */}
        {movie.overview && (
          <p className="text-xs sm:text-sm md:text-base text-neutral-300/95 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow">
            {movie.overview}
          </p>
        )}

        {/* Action Button */}
        <div className="pt-1.5 flex items-center space-x-3">
          <Link
            to={`/movie/${movie.id}`}
            className="inline-flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-purple-950/50 hover:shadow-purple-900/60 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
            aria-label={`View details for ${movie.title}`}
          >
            <Info className="w-4 h-4" />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
