import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Bookmark, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { checkBackendHealth } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const { data: health, isSuccess, isError, isLoading } = useQuery({
    queryKey: ['backend-health'],
    queryFn: checkBackendHealth,
    refetchInterval: 15000,
    retry: 2,
  });

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-neutral-900/80 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2.5 text-xl font-bold tracking-tight text-white hover:opacity-90 transition">
            <Film className="w-6 h-6 text-purple-500" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">CineScope</span>
          </Link>
          <nav className="hidden sm:flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                location.pathname === '/'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/wishlist"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                location.pathname === '/wishlist'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Wishlist</span>
            </Link>
          </nav>
        </div>

        {/* Backend Connectivity Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-neutral-800 bg-neutral-900">
            <Activity className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-400">API:</span>
            {isLoading && <span className="text-yellow-400 animate-pulse">Connecting...</span>}
            {isSuccess && (
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Online ({health.uptime}s)</span>
              </span>
            )}
            {isError && (
              <span className="text-red-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
