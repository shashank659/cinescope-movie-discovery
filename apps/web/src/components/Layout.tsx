import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-500">
        CineScope &copy; {new Date().getFullYear()} &mdash; Full-Stack Movie Discovery & Wishlist
      </footer>
    </div>
  );
};
