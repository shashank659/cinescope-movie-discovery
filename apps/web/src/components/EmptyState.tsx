import React from 'react';
import { Film, SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  isSearch?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No movies found',
  message = 'We could not find any movies matching your request.',
  isSearch = false,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800/80 ${className}`}
      data-testid="empty-state"
    >
      <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-400 mb-4 shadow-inner">
        {isSearch ? <SearchX className="w-7 h-7 text-purple-400" /> : <Film className="w-7 h-7 text-purple-400" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-neutral-400 max-w-sm mb-5 leading-relaxed">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
