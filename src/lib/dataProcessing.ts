import type { TMovie } from "../types";
import * as d3 from "d3";

/**
 * Get top N genres for each year
 */
export function getTopGenresByYear(movies: TMovie[], topN: number = 3) {
  // Group movies by year
  const moviesByYear = d3.group(movies, (d) => d.year.getFullYear());

  const result: { year: number; genres: { genre: string; count: number }[] }[] = [];

  moviesByYear.forEach((moviesInYear, year) => {
    // Count genres for this year
    const genreCounts: { [genre: string]: number } = {};
    moviesInYear.forEach((movie) => {
      movie.genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    // Sort and get top N
    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);

    result.push({ year, genres: topGenres });
  });

  return result.sort((a, b) => a.year - b.year);
}

/**
 * Calculate genre co-occurrence matrix
 */
export function getGenreCooccurrence(movies: TMovie[]) {
  const matrix: { [key: string]: { [key: string]: number } } = {};

  // Get all unique genres
  const allGenres = new Set<string>();
  movies.forEach((movie) => {
    movie.genres.forEach((genre) => allGenres.add(genre));
  });

  // Initialize matrix
  allGenres.forEach((genre1) => {
    matrix[genre1] = {};
    allGenres.forEach((genre2) => {
      matrix[genre1][genre2] = 0;
    });
  });

  // Count co-occurrences
  movies.forEach((movie) => {
    const genres = movie.genres;
    for (let i = 0; i < genres.length; i++) {
      for (let j = 0; j < genres.length; j++) {
        if (i !== j) {
          matrix[genres[i]][genres[j]]++;
        }
      }
    }
  });

  return { matrix, genres: Array.from(allGenres).sort() };
}

/**
 * Get genre rankings over time (for bump chart)
 */
export function getGenreRankingsOverTime(movies: TMovie[], topN: number = 3) {
  const topByYear = getTopGenresByYear(movies, topN);

  // Collect all genres that appear in top N at any point
  const topGenresSet = new Set<string>();
  topByYear.forEach((yearData) => {
    yearData.genres.forEach((g) => topGenresSet.add(g.genre));
  });

  // Create ranking data for each genre
  const genreRankings: { genre: string; data: { year: number; rank: number; count: number }[] }[] = [];

  topGenresSet.forEach((genre) => {
    const data: { year: number; rank: number; count: number }[] = [];
    topByYear.forEach((yearData) => {
      const genreIndex = yearData.genres.findIndex((g) => g.genre === genre);
      if (genreIndex !== -1) {
        data.push({
          year: yearData.year,
          rank: genreIndex + 1,
          count: yearData.genres[genreIndex].count,
        });
      }
    });
    genreRankings.push({ genre, data });
  });

  return genreRankings;
}
