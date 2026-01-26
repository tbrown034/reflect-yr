// library/api/providers/types.js
// Category definitions and unified item shape for multi-category lists

/**
 * All supported list categories
 */
export const CATEGORIES = {
  movie: {
    id: "movie",
    name: "Movies",
    provider: "tmdb",
    icon: "film",
    hasImages: true,
    hasYear: true,
  },
  tv: {
    id: "tv",
    name: "TV Shows",
    provider: "tmdb",
    icon: "tv",
    hasImages: true,
    hasYear: true,
  },
  book: {
    id: "book",
    name: "Books",
    provider: "openLibrary",
    icon: "book",
    hasImages: true,
    hasYear: true,
  },
  podcast: {
    id: "podcast",
    name: "Podcasts",
    provider: "itunes",
    icon: "microphone",
    hasImages: true,
    hasYear: true,
  },
  album: {
    id: "album",
    name: "Albums",
    provider: "itunes",
    icon: "musical-note",
    hasImages: true,
    hasYear: true,
  },
  custom: {
    id: "custom",
    name: "Custom",
    provider: "custom",
    icon: "pencil",
    hasImages: false,
    hasYear: true,
  },
};

/**
 * Get category config by ID
 */
export function getCategory(categoryId) {
  return CATEGORIES[categoryId] || CATEGORIES.custom;
}

/**
 * Get all categories as array (for UI selectors)
 */
export function getAllCategories() {
  return Object.values(CATEGORIES);
}

/**
 * Get categories that use a specific provider
 */
export function getCategoriesByProvider(providerId) {
  return Object.values(CATEGORIES).filter((c) => c.provider === providerId);
}

/**
 * Normalize any provider-specific item into unified shape
 * This is the canonical item format used throughout the app
 *
 * @param {Object} raw - Raw item from any provider
 * @param {string} category - Category ID (movie, book, athlete, etc.)
 * @param {string} provider - Provider ID (tmdb, openLibrary, etc.)
 * @returns {Object} Normalized item
 */
export function normalizeItem(raw, category, provider) {
  // Base shape all items must have
  return {
    // Identity
    id: raw.id,
    externalId: raw.externalId || raw.id,
    category,
    provider,

    // Display
    name: raw.name || raw.title,
    image: raw.image || null,
    year: raw.year || null,
    subtitle: raw.subtitle || null,

    // Category-specific metadata (preserved as-is)
    metadata: raw.metadata || {},

    // User additions (set later when added to list)
    rank: null,
    userRating: null,
    comment: "",
  };
}

/**
 * Create an empty custom item
 */
export function createCustomItem({ name, year, image, metadata = {} }) {
  const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    externalId: id,
    category: "custom",
    provider: "custom",
    name,
    image,
    year,
    subtitle: null,
    metadata,
    rank: null,
    userRating: null,
    comment: "",
  };
}
