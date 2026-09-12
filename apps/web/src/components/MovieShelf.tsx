import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MovieSummary } from '@cinescope/shared';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './MovieCardSkeleton';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

interface MovieShelfProps {
  title: string;
  icon?: React.ReactNode;
  movies?: MovieSummary[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

export const MovieShelf: React.FC<MovieShelfProps> = ({
  title,
  icon,
  movies = [],
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className={`space-y-3.5 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          {icon && <span className="text-purple-400">{icon}</span>}
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{title}</h2>
        </div>

        {/* Scroll Controls (hidden on small touch screens) */}
        {!isLoading && !isError && movies.length > 0 && (
          <div className="hidden sm:flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-flow-col auto-cols-[145px] sm:auto-cols-[175px] md:auto-cols-[195px] lg:auto-cols-[210px] gap-4 overflow-x-hidden py-1">
          {Array.from({ length: 6 }).map((_, idx) => (
            <MovieCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title={`Could not load ${title.toLowerCase()}`}
          message={errorMessage}
          onRetry={onRetry}
          className="py-6"
        />
      ) : movies.length === 0 ? (
        <EmptyState title="No movies available in this category" className="py-6" />
      ) : (
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-none w-[145px] sm:w-[175px] md:w-[195px] lg:w-[210px]"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
