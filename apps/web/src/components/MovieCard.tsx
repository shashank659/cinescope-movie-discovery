import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { MovieSummary } from '@cinescope/shared';
import { getPosterUrl, formatReleaseYear } from '../services/movieApi';
import { PosterFallback } from './PosterFallback';

interface MovieCardProps {
  movie: MovieSummary;
  className?: string;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, className = '', priority = false }) => {
  const [imageError, setImageError] = useState(false);
  const posterUrl = getPosterUrl(movie.posterPath || movie.poster_path);
  const releaseYear = formatReleaseYear(movie.releaseDate || movie.release_date);
  const rating = movie.voteAverage || movie.vote_average || 0;

  // Rating color accent
  const ratingColor =
    rating >= 7.5
      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
      : rating >= 5.5
      ? 'text-amber-400 bg-amber-950/80 border-amber-800/60'
      : 'text-neutral-400 bg-neutral-900/80 border-neutral-800';

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={`group relative flex flex-col rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/80 transition-all duration-300 hover:scale-[1.03] hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-neutral-950 ${className}`}
      aria-label={`View details for ${movie.title} (${releaseYear})`}
      data-testid={`movie-card-${movie.id}`}
    >
      {/* Poster Media Box */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-neutral-950">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PosterFallback title={movie.title} />
        )}

        {/* Rating Badge Overlay */}
        <div
          className={`absolute top-2.5 right-2.5 flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-semibold backdrop-blur-md border ${ratingColor}`}
        >
          <Star className="w-3 h-3 fill-current" />
          <span>{rating > 0 ? rating.toFixed(1) : 'NR'}</span>
        </div>

        {/* Subtle Dark Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* Info Container */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-neutral-900/90">
        <h3
          className="text-sm font-semibold text-neutral-100 group-hover:text-purple-400 transition-colors line-clamp-1 leading-snug"
          title={movie.title}
        >
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-xs text-neutral-400">
          <span>{releaseYear}</span>
          <span className="text-[11px] text-neutral-500 uppercase tracking-wide">Movie</span>
        </div>
      </div>
    </Link>
  );
};
