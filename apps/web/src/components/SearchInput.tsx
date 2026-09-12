import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className = '',
  placeholder = 'Search movies...',
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get('q') || searchParams.get('query') || '';
  const [value, setValue] = useState(currentQuery);

  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-9 py-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-850 focus:bg-neutral-900 text-sm text-neutral-100 placeholder-neutral-500 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
        aria-label="Search movies"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
};
