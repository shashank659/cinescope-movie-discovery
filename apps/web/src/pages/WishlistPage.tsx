import React from 'react';
import { Bookmark } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
          <Bookmark className="w-6 h-6 text-purple-400" />
          <span>My Wishlist</span>
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Saved movies will appear here once the persistence milestone is implemented.
        </p>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 border-dashed rounded-xl p-12 text-center">
        <Bookmark className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
        <h3 className="text-base font-medium text-neutral-300">No movies saved yet</h3>
        <p className="text-xs text-neutral-500 mt-1">
          Wishlist storage and API endpoints will be added in upcoming milestones.
        </p>
      </div>
    </div>
  );
};
