import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchMovies } from '../services/movieApi';
import { MovieCard } from '../components/MovieCard';
import { MovieCardSkeleton } from '../components/MovieCardSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { SearchInput } from '../components/SearchInput';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || searchParams.get('query') || '').trim();
  const [page, setPage] = useState(1);

  // Reset page when query changes
  React.useEffect(() => {
    setPage(1);
  }, [query]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => searchMovies(query, page),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 mins
  });

  return (
    <div className="space-y-8 pb-12" data-testid="search-page">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4 pt-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Search Movies</h1>
        <p className="text-sm text-neutral-400">
          Find movies by title, franchise, or keywords from the CineScope catalog.
        </p>
        <SearchInput
          className="max-w-xl mx-auto shadow-xl"
          placeholder="Search by movie title (e.g. Inception, Avengers)..."
          autoFocus={!query}
        />
      </div>

      {/* No Query State */}
      {!query && (
        <div className="py-12">
          <EmptyState
            title="Start Searching"
            message="Type a movie title in the search box above to discover films."
          />
        </div>
      )}

      {/* Query Active Results */}
      {query && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-semibold text-white">
                Results for &quot;<span className="text-purple-400">{query}</span>&quot;
              </h2>
            </div>
            {data && (
              <span className="text-xs text-neutral-400">
                {data.totalResults.toLocaleString()} {data.totalResults === 1 ? 'movie' : 'movies'} found
              </span>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
              data-testid="search-loading"
            >
              {Array.from({ length: 10 }).map((_, idx) => (
                <MovieCardSkeleton key={idx} />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <ErrorState
              title="Search failed"
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          )}

          {/* Empty Results */}
          {!isLoading && !isError && data && data.results.length === 0 && (
            <EmptyState
              title="No movies found"
              message={`We couldn't find any movies matching "${query}". Try checking for spelling or searching for another title.`}
              isSearch
            />
          )}

          {/* Movie Results Grid */}
          {!isLoading && !isError && data && data.results.length > 0 && (
            <>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
                data-testid="search-results-grid"
              >
                {data.results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {/* Pagination Controls */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-3 pt-6 border-t border-neutral-800/80">
                  <button
                    onClick={() => {
                      setPage((prev) => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page <= 1 || isFetching}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs text-neutral-400">
                    Page <span className="text-white font-semibold">{page}</span> of{' '}
                    <span className="text-white font-semibold">{data.totalPages}</span>
                  </span>

                  <button
                    onClick={() => {
                      setPage((prev) => Math.min(prev + 1, data.totalPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page >= data.totalPages || isFetching}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
