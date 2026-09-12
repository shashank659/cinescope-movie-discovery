import React from 'react';
import { Film } from 'lucide-react';

interface PosterFallbackProps {
  title: string;
  className?: string;
}

export const PosterFallback: React.FC<PosterFallbackProps> = ({ title, className = '' }) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 p-4 text-center select-none ${className}`}
      aria-label={`No poster available for ${title}`}
    >
      <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 mb-2">
        <Film className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-neutral-400 line-clamp-2 px-1">
        {title}
      </span>
      <span className="text-[10px] text-neutral-600 mt-1 uppercase tracking-wider">
        No Poster
      </span>
    </div>
  );
};
