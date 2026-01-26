/**
 * Shared utilities for list themes
 * All themes should use these for consistent behavior across media types
 */

// TMDB image base URLs
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const POSTER_SIZES = {
  small: "w92",
  medium: "w200",
  large: "w300",
  xlarge: "w500",
};

/**
 * Get year from any item shape (TMDB or unified provider)
 */
export function getYear(item) {
  if (!item) return null;
  if (item.release_date) return item.release_date.split("-")[0];
  if (item.first_air_date) return item.first_air_date.split("-")[0];
  if (item.year) return String(item.year);
  return null;
}

/**
 * Get display title from any item shape
 */
export function getTitle(item) {
  if (!item) return "Untitled";
  return item.title || item.name || "Untitled";
}

/**
 * Get image URL from any item shape with size option
 * @param {Object} item - The media item
 * @param {string} size - Size key: small, medium, large, xlarge
 * @returns {string|null} Full image URL or null
 */
export function getImageUrl(item, size = "medium") {
  if (!item) return null;

  // Check for unified provider shape first
  if (item.image) {
    // Already a full URL
    if (item.image.startsWith("http")) return item.image;
    // TMDB path
    if (item.image.startsWith("/"))
      return `${TMDB_IMAGE_BASE}/${POSTER_SIZES[size]}${item.image}`;
    return item.image;
  }

  // Check for TMDB poster_path
  if (item.poster_path) {
    return `${TMDB_IMAGE_BASE}/${POSTER_SIZES[size]}${item.poster_path}`;
  }

  return null;
}

/**
 * Check if item has a valid image
 */
export function hasImage(item) {
  return !!(item?.image || item?.poster_path);
}

/**
 * Get subtitle/secondary info from item
 */
export function getSubtitle(item) {
  if (!item) return null;
  if (item.subtitle) return item.subtitle;
  // For TV shows, could show network
  if (item.networks?.[0]?.name) return item.networks[0].name;
  return null;
}

/**
 * Get rating display (user rating or external rating)
 */
export function getRating(item) {
  if (!item) return null;
  // User rating takes priority
  if (item.userRating) return { value: item.userRating, type: "user", max: 5 };
  // TMDB rating
  if (item.vote_average)
    return { value: item.vote_average, type: "tmdb", max: 10 };
  // Metadata rating
  if (item.metadata?.rating)
    return { value: item.metadata.rating, type: "external", max: 10 };
  return null;
}

/**
 * Truncate text with ellipsis, preserving whole words when possible
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character length
 * @param {boolean} preserveWords - Try to break at word boundaries
 */
export function truncateText(text, maxLength = 100, preserveWords = true) {
  if (!text || text.length <= maxLength) return text || "";

  if (!preserveWords) {
    return text.slice(0, maxLength - 3) + "...";
  }

  // Find last space before maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.5) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated.slice(0, maxLength - 3) + "...";
}

/**
 * Normalize special characters in titles for consistent display
 * Handles common problematic characters
 */
export function normalizeTitle(title) {
  if (!title) return "";
  // Replace common problematic characters
  return title
    .replace(/[\u2018\u2019]/g, "'") // Smart quotes to apostrophe
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
    .replace(/\u2026/g, "...") // Ellipsis
    .replace(/[\u2013\u2014]/g, "-") // En/em dashes
    .trim();
}

/**
 * Common Framer Motion animation variants
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const flipIn = {
  initial: { rotateX: -90, opacity: 0 },
  animate: { rotateX: 0, opacity: 1 },
  exit: { rotateX: 90, opacity: 0 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerContainerSlow = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Generate gradient from accent color
 */
export function getGradient(accentColor, direction = "135deg", opacity = 0.3) {
  const opacityHex = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  const lightOpacity = Math.round(opacity * 0.5 * 255)
    .toString(16)
    .padStart(2, "0");
  return `linear-gradient(${direction}, ${accentColor}${opacityHex}, ${accentColor}${lightOpacity})`;
}

/**
 * Darken a hex color
 */
export function darkenColor(hex, percent = 20) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

/**
 * Lighten a hex color
 */
export function lightenColor(hex, percent = 20) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

/**
 * Check if color is dark (for contrast decisions)
 */
export function isDarkColor(hex) {
  const num = parseInt(hex.replace("#", ""), 16);
  const R = num >> 16;
  const G = (num >> 8) & 0x00ff;
  const B = num & 0x0000ff;
  const luminance = (0.299 * R + 0.587 * G + 0.114 * B) / 255;
  return luminance < 0.5;
}

/**
 * Get contrasting text color (black or white) for a background
 */
export function getContrastColor(hex) {
  return isDarkColor(hex) ? "#FFFFFF" : "#000000";
}

/**
 * Default theme props for consistency
 */
export const defaultThemeProps = {
  accentColor: "#3B82F6",
  isEditable: false,
  onUpdateComment: null,
  onUpdateRating: null,
};

/**
 * Fallback image placeholder component styles
 */
export const fallbackImageStyles = {
  container:
    "w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700",
  text: "text-gray-400 dark:text-gray-500 text-xs text-center px-2",
};

/**
 * Render star rating as a string (for simpler themes)
 */
export function renderStarsString(rating, filled = "\u2605", empty = "\u2606") {
  if (!rating || rating < 1) return "";
  const stars = Math.min(5, Math.max(1, Math.round(rating)));
  return filled.repeat(stars) + empty.repeat(5 - stars);
}
