import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp, Award, PlayCircle, Calendar, Tag } from 'lucide-react';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getMovieGenres,
} from '../services/movieApi';
import { HeroBanner } from '../components/HeroBanner';
import { MovieShelf } from '../components/MovieShelf';

export const HomePage: React.FC = () => {
  // Queries for each discovery section
  const trendingQuery = useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: () => getTrendingMovies(1),
  });

  const popularQuery = useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => getPopularMovies(1),
  });

  const topRatedQuery = useQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: () => getTopRatedMovies(1),
  });

  const nowPlayingQuery = useQuery({
    queryKey: ['movies', 'now-playing'],
    queryFn: () => getNowPlayingMovies(1),
  });

  const upcomingQuery = useQuery({
    queryKey: ['movies', 'upcoming'],
    queryFn: () => getUpcomingMovies(1),
  });

  const genresQuery = useQuery({
    queryKey: ['movies', 'genres'],
    queryFn: () => getMovieGenres(),
  });

  // Pick first movie from trending or popular for the featured hero
  const featuredMovie = trendingQuery.data?.results?.[0] || popularQuery.data?.results?.[0];

  return (
    <div className="space-y-8 sm:space-y-10 pb-12">
      {/* Hero Featured Movie */}
      <HeroBanner
        movie={featuredMovie}
        isLoading={trendingQuery.isLoading && !featuredMovie}
      />

      {/* Genre Pills */}
      {genresQuery.data?.genres && genresQuery.data.genres.length > 0 && (
        <section className="space-y-2.5 pt-1" aria-label="Explore Popular Genres">
          <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span>Explore Popular Genres</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {genresQuery.data.genres.map((genre) => (
              <Link
                key={genre.id}
                to={`/search?q=${encodeURIComponent(genre.name)}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-neutral-900/90 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 hover:border-purple-500/50 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-1 focus:ring-offset-neutral-950 active:scale-95"
                title={`Explore ${genre.name} movies`}
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Movie Shelves */}
      <div className="space-y-10">
        {/* Trending */}
        <MovieShelf
          title="Trending This Week"
          icon={<Flame className="w-5 h-5" />}
          movies={trendingQuery.data?.results}
          isLoading={trendingQuery.isLoading}
          isError={trendingQuery.isError}
          errorMessage={(trendingQuery.error as Error)?.message}
          onRetry={() => trendingQuery.refetch()}
        />

        {/* Popular */}
        <MovieShelf
          title="Popular Movies"
          icon={<TrendingUp className="w-5 h-5" />}
          movies={popularQuery.data?.results}
          isLoading={popularQuery.isLoading}
          isError={popularQuery.isError}
          errorMessage={(popularQuery.error as Error)?.message}
          onRetry={() => popularQuery.refetch()}
        />

        {/* Top Rated */}
        <MovieShelf
          title="Top Rated Classics"
          icon={<Award className="w-5 h-5" />}
          movies={topRatedQuery.data?.results}
          isLoading={topRatedQuery.isLoading}
          isError={topRatedQuery.isError}
          errorMessage={(topRatedQuery.error as Error)?.message}
          onRetry={() => topRatedQuery.refetch()}
        />

        {/* Now Playing */}
        <MovieShelf
          title="Now Playing in Theatres"
          icon={<PlayCircle className="w-5 h-5" />}
          movies={nowPlayingQuery.data?.results}
          isLoading={nowPlayingQuery.isLoading}
          isError={nowPlayingQuery.isError}
          errorMessage={(nowPlayingQuery.error as Error)?.message}
          onRetry={() => nowPlayingQuery.refetch()}
        />

        {/* Upcoming */}
        <MovieShelf
          title="Upcoming Releases"
          icon={<Calendar className="w-5 h-5" />}
          movies={upcomingQuery.data?.results}
          isLoading={upcomingQuery.isLoading}
          isError={upcomingQuery.isError}
          errorMessage={(upcomingQuery.error as Error)?.message}
          onRetry={() => upcomingQuery.refetch()}
        />
      </div>
    </div>
  );
};
