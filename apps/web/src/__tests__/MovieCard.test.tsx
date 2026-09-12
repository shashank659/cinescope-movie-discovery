import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { MovieCard } from '../components/MovieCard';
import type { MovieSummary } from '@cinescope/shared';

const mockMovie: MovieSummary = {
  id: 101,
  title: 'Inception',
  overview: 'A thief who steals corporate secrets...',
  posterPath: '/inception.jpg',
  backdropPath: '/inception_bg.jpg',
  releaseDate: '2010-07-15',
  voteAverage: 8.36,
  voteCount: 35000,
  genreIds: [28, 878],
  popularity: 120.5,
};

describe('MovieCard Component', () => {
  it('renders movie title, release year, and formatted rating', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('8.4')).toBeInTheDocument();
  });

  it('links to the correct movie details route', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link', { name: /view details for inception/i });
    expect(link).toHaveAttribute('href', '/movie/101');
  });

  it('renders poster fallback when poster image encounters an error', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );

    const img = screen.getByAltText(/inception poster/i);
    expect(img).toBeInTheDocument();

    // Trigger image loading failure
    fireEvent.error(img);

    expect(screen.getByText(/no poster/i)).toBeInTheDocument();
  });

  it('renders poster fallback immediately if posterPath is null', () => {
    const movieWithoutPoster: MovieSummary = {
      ...mockMovie,
      posterPath: null,
      poster_path: null,
    };

    render(
      <BrowserRouter>
        <MovieCard movie={movieWithoutPoster} />
      </BrowserRouter>
    );

    expect(screen.getByText(/no poster/i)).toBeInTheDocument();
  });
});
