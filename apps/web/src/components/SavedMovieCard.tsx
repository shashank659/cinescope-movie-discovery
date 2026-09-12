import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { getPosterUrl, formatReleaseYear } from '../services/movieApi';
import { PosterFallback } from './PosterFallback';

interface SavedMovieCardProps {
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  releaseDate: string | null;
  onRemove: (movieId: number) => Promise<void> | void;
  removeLabel?: string;
}

export const SavedMovieCard: React.FC<SavedMovieCardProps> = ({
  movieId,
  movieTitle,
  posterPath,
  releaseDate,
  onRemove,
  removeLabel = 'Remove',
}) => {
  const [imageError, setImageError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const posterUrl = getPosterUrl(posterPath);
  const releaseYear = formatReleaseYear(releaseDate);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRemoving(true);
    try {
      await onRemove(movieId);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 transition-all hover:border-purple-500/50 hover:shadow-lg focus-within:ring-2 focus-within:ring-purple-500"
      data-testid={`saved-movie-card-${movieId}`}
    >
      <Link to={`/movie/${movieId}`} className="relative aspect-[2/3] w-full bg-neutral-950 overflow-hidden block">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={`${movieTitle} poster`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <PosterFallback title={movieTitle} />
        )}
      </Link>

      <div className="p-3 flex items-center justify-between bg-neutral-900/90 gap-2">
        <Link to={`/movie/${movieId}`} className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-purple-400 truncate">
            {movieTitle}
          </h4>
          <span className="text-[11px] text-neutral-400 block mt-0.5">{releaseYear}</span>
        </Link>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition shrink-0 active:scale-90 disabled:opacity-50"
          title={removeLabel}
          aria-label={`${removeLabel} ${movieTitle}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
