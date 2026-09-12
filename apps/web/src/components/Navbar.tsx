import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Bookmark, Heart, LogIn, LogOut, User, Search, X } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-neutral-900/90 border-b border-neutral-800/90 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Main Navigation */}
        <div className="flex items-center space-x-3 sm:space-x-6 md:space-x-8 shrink-0">
          <Link
            to="/"
            className="flex items-center space-x-2 text-lg sm:text-xl font-bold tracking-tight text-white hover:opacity-90 transition shrink-0"
            aria-label="CineScope Home"
          >
            <Film className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 shrink-0" />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 bg-clip-text text-transparent">
              CineScope
            </span>
          </Link>

          <nav className="flex items-center space-x-1 sm:space-x-1.5" aria-label="Main Navigation">
            <Link
              to="/"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                location.pathname === '/'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/watchlist"
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                location.pathname === '/watchlist'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
              aria-label="Watchlist"
            >
              <Bookmark className="w-4 h-4 shrink-0 text-purple-400 sm:text-current" />
              <span className="hidden sm:inline">Watchlist</span>
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                location.pathname === '/favorites'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
              aria-label="Favorites"
            >
              <Heart className="w-4 h-4 shrink-0 text-rose-400 sm:text-current" />
              <span className="hidden sm:inline">Favorites</span>
            </Link>
          </nav>
        </div>

        {/* Center: Search Input (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-2">
          <SearchInput className="w-full" placeholder="Search movies by title..." />
        </div>

        {/* Right: Auth & Mobile Search Toggle */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition active:scale-95"
            aria-label="Toggle search bar"
          >
            {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center space-x-2 pl-0.5 sm:pl-1">
              <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-800/90 border border-neutral-700/60 text-xs font-medium text-neutral-200">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="max-w-[90px] truncate">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-neutral-800/80 border border-neutral-800 transition flex items-center space-x-1.5 active:scale-95"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 pl-0.5 sm:pl-1">
              <Link
                to="/login"
                className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-neutral-800/80 bg-neutral-900 p-3 px-4 shadow-xl">
          <SearchInput className="w-full" placeholder="Search movies..." autoFocus />
        </div>
      )}
    </header>
  );
};
