// library/api/providers/tmdb.js
// TMDB provider wrapper - normalizes movie/TV data to unified item shape

import {
  getMovies,
  getTvShows,
  getMovieById,
  getTvShowById,
  searchTmdbByTitle,
} from "../tmdb.js";

const LOG_PREFIX = "[TMDBProvider]";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p";

/**
 * Get poster URL from TMDB path
 */
export function getPosterUrl(posterPath, size = "w500") {
  if (!posterPath) return null;
  return `${POSTER_BASE_URL}/${size}${posterPath}`;
}

/**
 * Extract year from date string
 */
function extractYear(dateStr) {
  if (!dateStr) return null;
  return parseInt(dateStr.split("-")[0], 10) || null;
}

/**
 * Normalize TMDB movie to unified item shape
 */
function normalizeMovie(raw) {
  return {
    id: `tmdb_movie_${raw.id}`,
    externalId: raw.id,
    category: "movie",
    provider: "tmdb",
    name: raw.title,
    image: getPosterUrl(raw.poster_path),
    year: extractYear(raw.release_date),
    subtitle: raw.release_date ? `${extractYear(raw.release_date)}` : null,
    metadata: {
      originalTitle: raw.original_title,
      overview: raw.overview,
      voteAverage: raw.vote_average,
      voteCount: raw.vote_count,
      popularity: raw.popularity,
      genreIds: raw.genre_ids,
      posterPath: raw.poster_path,
      backdropPath: raw.backdrop_path,
    },
    rank: null,
    userRating: null,
    comment: "",
  };
}

/**
 * Normalize TMDB TV show to unified item shape
 */
function normalizeTvShow(raw) {
  return {
    id: `tmdb_tv_${raw.id}`,
    externalId: raw.id,
    category: "tv",
    provider: "tmdb",
    name: raw.name,
    image: getPosterUrl(raw.poster_path),
    year: extractYear(raw.first_air_date),
    subtitle: raw.first_air_date ? `${extractYear(raw.first_air_date)}` : null,
    metadata: {
      originalName: raw.original_name,
      overview: raw.overview,
      voteAverage: raw.vote_average,
      voteCount: raw.vote_count,
      popularity: raw.popularity,
      genreIds: raw.genre_ids,
      posterPath: raw.poster_path,
      backdropPath: raw.backdrop_path,
    },
    rank: null,
    userRating: null,
    comment: "",
  };
}

/**
 * Search for movies or TV shows
 */
export async function search(query, options = {}) {
  const { category = "movie", year, limit = 10 } = options;
  console.log(`${LOG_PREFIX} Searching ${category}: "${query}"`);

  try {
    const mediaType = category === "tv" ? "tv" : "movie";
    const results = await searchTmdbByTitle(query, year, mediaType);
    const normalizer = category === "tv" ? normalizeTvShow : normalizeMovie;
    return results.slice(0, limit).map(normalizer);
  } catch (error) {
    console.error(`${LOG_PREFIX} Search error:`, error);
    return [];
  }
}

/**
 * Discover popular/trending items
 */
export async function discover(options = {}) {
  const { category = "movie", year, startYear, endYear, isDecade, sortBy, limit = 20 } = options;
  const yearLabel = isDecade ? `${startYear}s` : (year || "all");
  console.log(`${LOG_PREFIX} Discovering ${category}, year: ${yearLabel}`);

  try {
    if (category === "tv") {
      const results = await getTvShows({ year, startYear, endYear, sortBy, limit });
      return results.map(normalizeTvShow);
    } else {
      const results = await getMovies({ year, startYear, endYear, sortBy, limit });
      return results.map(normalizeMovie);
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Discover error:`, error);
    return [];
  }
}

/**
 * Get item by ID
 */
export async function getById(id, options = {}) {
  const { category = "movie" } = options;

  // Handle both raw TMDB IDs and prefixed IDs
  const tmdbId = String(id).replace(/^tmdb_(movie|tv)_/, "");
  console.log(`${LOG_PREFIX} Getting ${category} by ID: ${tmdbId}`);

  try {
    if (category === "tv") {
      const raw = await getTvShowById(tmdbId);
      return raw ? normalizeTvShow(raw) : null;
    } else {
      const raw = await getMovieById(tmdbId);
      return raw ? normalizeMovie(raw) : null;
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} GetById error:`, error);
    return null;
  }
}

/**
 * Provider metadata
 */
export const providerInfo = {
  id: "tmdb",
  name: "The Movie Database",
  categories: ["movie", "tv"],
  requiresAuth: true, // Uses env token
  rateLimit: null, // No documented limit for normal usage
};
