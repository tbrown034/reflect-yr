"use server";

import { searchTmdbByTitle } from "@/library/api/tmdb";
import { search as providerSearch, CATEGORIES } from "@/library/api/providers";

const LOG_PREFIX = "[SearchAction]";

/**
 * Server Action to search TMDB for movies or TV shows (legacy)
 * This replaces the API route for better performance
 */
export async function searchMedia(query, type = "movie", year = null) {
  try {
    if (!query || query.length < 2) {
      return { error: "Query must be at least 2 characters", results: [] };
    }

    console.log(`${LOG_PREFIX} Search: query="${query}", type=${type}, year=${year}`);

    const results = await searchTmdbByTitle(
      query,
      year ? parseInt(year) : null,
      type
    );

    console.log(`${LOG_PREFIX} Found ${results.length} results`);

    return { results };
  } catch (error) {
    console.error(`${LOG_PREFIX} Search error:`, error);
    return { error: "Search failed", results: [] };
  }
}

/**
 * Server Action to search across any category using the unified provider system
 * @param {string} query - Search query
 * @param {string} category - Category ID (movie, tv, book, athlete, anime, podcast, etc.)
 * @param {Object} options - Additional options (limit, year, etc.)
 */
export async function searchByCategory(query, category = "movie", options = {}) {
  try {
    if (!query || query.length < 2) {
      return { error: "Query must be at least 2 characters", results: [] };
    }

    if (!CATEGORIES[category]) {
      return { error: `Invalid category: ${category}`, results: [] };
    }

    console.log(`${LOG_PREFIX} Category search: query="${query}", category=${category}`);

    const results = await providerSearch(query, category, {
      limit: options.limit || 10,
      year: options.year,
      ...options,
    });

    console.log(`${LOG_PREFIX} Found ${results.length} results for ${category}`);

    return { results, category };
  } catch (error) {
    console.error(`${LOG_PREFIX} Category search error:`, error);
    return { error: "Search failed", results: [] };
  }
}
