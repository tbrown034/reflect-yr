// library/api/providers/index.js
// Unified provider interface for all list categories

import * as tmdbProvider from "./tmdb.js";
import * as openLibraryProvider from "./openLibrary.js";
import * as sportsDbProvider from "./sportsDb.js";
import * as jikanProvider from "./jikan.js";
import * as itunesProvider from "./itunes.js";
import {
  CATEGORIES,
  getCategory,
  getAllCategories,
  normalizeItem,
  createCustomItem,
} from "./types.js";

const LOG_PREFIX = "[Providers]";

/**
 * Parse year parameter - handles both single years and decade ranges
 * @param {string|number} yearParam - Year value like "2024" or "decade-2020"
 * @returns {{ year: number|null, startYear: number|null, endYear: number|null, isDecade: boolean }}
 */
function parseYearParam(yearParam) {
  if (!yearParam) return { year: null, startYear: null, endYear: null, isDecade: false };

  const yearStr = String(yearParam);

  if (yearStr.startsWith("decade-")) {
    const decadeStart = parseInt(yearStr.replace("decade-", ""));
    return {
      year: null,
      startYear: decadeStart,
      endYear: decadeStart + 9,
      isDecade: true,
    };
  }

  const year = parseInt(yearStr);
  return {
    year,
    startYear: year,
    endYear: year,
    isDecade: false,
  };
}

/**
 * Provider registry - maps provider IDs to their implementations
 */
const providers = {
  tmdb: tmdbProvider,
  openLibrary: openLibraryProvider,
  sportsDb: sportsDbProvider,
  jikan: jikanProvider,
  itunes: itunesProvider,
};

/**
 * Get provider for a category
 */
function getProviderForCategory(categoryId) {
  const category = getCategory(categoryId);
  const provider = providers[category.provider];

  if (!provider && category.provider !== "custom") {
    console.warn(
      `${LOG_PREFIX} No provider found for category: ${categoryId}`
    );
    return null;
  }

  return provider;
}

/**
 * Search across any category
 *
 * @param {string} query - Search query
 * @param {string} category - Category ID (movie, book, athlete, etc.)
 * @param {Object} options - Additional options (limit, year, etc.)
 * @returns {Promise<Array>} Normalized items
 */
export async function search(query, category, options = {}) {
  if (!query || query.length < 2) return [];

  const categoryConfig = getCategory(category);
  console.log(`${LOG_PREFIX} Searching ${categoryConfig.name}: "${query}"`);

  // Custom category doesn't support search
  if (category === "custom") {
    console.log(`${LOG_PREFIX} Custom category doesn't support search`);
    return [];
  }

  const provider = getProviderForCategory(category);
  if (!provider) return [];

  try {
    // Pass category to provider for multi-category providers (like TMDB, SportsDB)
    const results = await provider.search(query, { ...options, category });
    return results;
  } catch (error) {
    console.error(`${LOG_PREFIX} Search error for ${category}:`, error);
    return [];
  }
}

/**
 * Discover popular/trending items for a category
 *
 * @param {string} category - Category ID
 * @param {Object} options - Options (year, limit, sortBy, etc.)
 * @returns {Promise<Array>} Normalized items
 */
export async function discover(category, options = {}) {
  const categoryConfig = getCategory(category);
  console.log(`${LOG_PREFIX} Discovering ${categoryConfig.name}`);

  if (category === "custom") {
    return [];
  }

  const provider = getProviderForCategory(category);
  if (!provider) return [];

  // Parse year parameter to handle decade ranges
  const { year, startYear, endYear, isDecade } = parseYearParam(options.year);

  try {
    const results = await provider.discover({
      ...options,
      category,
      year: isDecade ? null : year, // Single year for non-decade
      startYear,
      endYear,
      isDecade,
    });

    // For decade ranges, filter results to year range (if provider doesn't support it natively)
    if (isDecade && startYear && endYear) {
      return results.filter((item) => {
        if (!item.year) return true; // Include items without year
        return item.year >= startYear && item.year <= endYear;
      });
    }

    return results;
  } catch (error) {
    console.error(`${LOG_PREFIX} Discover error for ${category}:`, error);
    return [];
  }
}

/**
 * Get a single item by ID
 *
 * @param {string} id - Item ID (can be prefixed or raw)
 * @param {string} category - Category ID
 * @returns {Promise<Object|null>} Normalized item or null
 */
export async function getById(id, category) {
  console.log(`${LOG_PREFIX} Getting ${category} by ID: ${id}`);

  if (category === "custom") {
    console.log(`${LOG_PREFIX} Custom items are local-only`);
    return null;
  }

  const provider = getProviderForCategory(category);
  if (!provider) return null;

  try {
    const item = await provider.getById(id, { category });
    return item;
  } catch (error) {
    console.error(`${LOG_PREFIX} GetById error for ${category}:`, error);
    return null;
  }
}

/**
 * Get provider info
 */
export function getProviderInfo(providerId) {
  const provider = providers[providerId];
  return provider?.providerInfo || null;
}

/**
 * Get all available providers
 */
export function getAllProviders() {
  return Object.values(providers).map((p) => p.providerInfo);
}

/**
 * Check if a category is supported
 */
export function isCategorySupported(categoryId) {
  return !!CATEGORIES[categoryId];
}

// Re-export types utilities
export {
  CATEGORIES,
  getCategory,
  getAllCategories,
  normalizeItem,
  createCustomItem,
};

// Export individual providers for direct access if needed
export { tmdbProvider, openLibraryProvider, sportsDbProvider, jikanProvider, itunesProvider };
