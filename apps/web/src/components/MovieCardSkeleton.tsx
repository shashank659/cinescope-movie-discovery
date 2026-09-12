import React from 'react';

interface MovieCardSkeletonProps {
  className?: string;
}

export const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden bg-neutral-900/60 border border-neutral-850 animate-pulse ${className}`}
      data-testid="movie-card-skeleton"
    >
      {/* 2:3 aspect ratio poster skeleton */}
      <div className="w-full aspect-[2/3] bg-neutral-800/70" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-neutral-800 rounded w-4/5" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 bg-neutral-800 rounded w-1/3" />
          <div className="h-3 bg-neutral-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};
