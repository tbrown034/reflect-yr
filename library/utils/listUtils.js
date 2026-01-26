/**
 * Utility functions for working with lists in the application
 */

const LOG_PREFIX = "[listUtils]";

/**
 * Generates a unique ID for published lists
 * Combines timestamp with random string for uniqueness
 * @returns {string} Unique list ID
 */
export function generateListId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `list_${timestamp}_${randomStr}`;
}

/**
 * Generates a short, shareable code for public lists
 * 6 character alphanumeric code that's easy to share
 * @returns {string} Share code (e.g., "X7Kp2m")
 */
export function generateShareCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  console.log(`${LOG_PREFIX} Generated share code: ${code}`);
  return code;
}

/**
 * Format list share URL for a published list
 * @param {string} type - The list type ("movies" or "tv")
 * @param {string} listId - The unique list ID
 * @returns {string} Formatted URL for sharing
 */
export function formatShareUrl(type, listId) {
  return `/lists/${type}/publish/${listId}`;
}

/**
 * Get a shareable URL for a published list (includes domain)
 * @param {string} type - The list type ("movies" or "tv")
 * @param {string} listId - The unique list ID
 * @returns {string} Shareable URL for the list
 */
export function getShareableUrl(type, listId) {
  // Use the current domain with the list path
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/lists/${type}/publish/${listId}`;
}

/**
 * Get a public share URL using the share code
 * This is the URL meant for sharing externally (cleaner, shorter)
 * @param {string} shareCode - The 6-character share code
 * @returns {string} Public shareable URL
 */
export function getPublicShareUrl(shareCode) {
  if (!shareCode) return "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/share/${shareCode}`;
}

/**
 * Format list items for display or sharing as text
 * @param {Array} items - List of items to format
 * @param {string} itemType - Type of items ("movie" or "tv")
 * @returns {string} Formatted text representation of the list
 */
export function formatListText(items, itemType) {
  if (!items || items.length === 0) return "";

  return items
    .map((item, index) => {
      const title = itemType === "movie" ? item.title : item.name;
      const year =
        itemType === "movie"
          ? item.release_date
            ? new Date(item.release_date).getFullYear()
            : "Unknown"
          : item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : "Unknown";

      return `${index + 1}. ${title} (${year})`;
    })
    .join("\n");
}

/**
 * Format date for display in lists
 * @param {string} dateString - ISO date string
 * @param {string} format - Format type ('short' or 'long')
 * @returns {string} Formatted date string
 */
export function formatListDate(dateString, format = "short") {
  if (!dateString) return "Unknown Date";

  try {
    const options =
      format === "short"
        ? { year: "numeric", month: "short", day: "numeric" }
        : {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          };

    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid Date";
  }
}

/**
 * Calculate aggregate stats for all user lists
 * @param {Object} publishedLists - Object of published lists
 * @returns {Object} Aggregate statistics
 */
export function calculateListsStats(publishedLists) {
  const lists = Object.values(publishedLists || {});

  if (lists.length === 0) {
    return {
      totalLists: 0,
      totalItems: 0,
      avgRating: null,
      mostListedYear: null,
      hotTakesCount: 0,
      categoryBreakdown: {},
    };
  }

  let totalItems = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let hotTakesCount = 0;
  const yearCounts = {};
  const categoryBreakdown = {};

  lists.forEach((list) => {
    totalItems += list.items?.length || 0;
    categoryBreakdown[list.type] = (categoryBreakdown[list.type] || 0) + 1;

    list.items?.forEach((item) => {
      // User rating
      if (item.userRating) {
        ratingSum += item.userRating;
        ratingCount++;
      }

      // Year counting - handle various year formats
      const year =
        item.year ||
        (item.release_date ? parseInt(item.release_date.split("-")[0]) : null) ||
        (item.first_air_date ? parseInt(item.first_air_date.split("-")[0]) : null);

      if (year) {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }

      // Hot takes (user rating differs from consensus by 3+ points on 10-point scale)
      // userRating is 1-5 scale, vote_average is 1-10 scale
      if (item.userRating && item.vote_average) {
        const userOn10 = item.userRating * 2;
        const diff = Math.abs(userOn10 - item.vote_average);
        if (diff >= 3) hotTakesCount++;
      }
    });
  });

  // Find most common year
  const mostListedYear =
    Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    totalLists: lists.length,
    totalItems,
    avgRating: ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : null,
    mostListedYear: mostListedYear ? parseInt(mostListedYear) : null,
    hotTakesCount,
    categoryBreakdown,
  };
}

/**
 * Calculate stats for a single list
 * @param {Object} list - Published list object
 * @returns {Object} List statistics
 */
export function calculateSingleListStats(list) {
  if (!list?.items?.length) {
    return { avgRating: null, hotTakesCount: 0 };
  }

  let ratingSum = 0;
  let ratingCount = 0;
  let hotTakesCount = 0;

  list.items.forEach((item) => {
    if (item.userRating) {
      ratingSum += item.userRating;
      ratingCount++;
    }

    // Hot takes calculation
    if (item.userRating && item.vote_average) {
      const userOn10 = item.userRating * 2;
      const diff = Math.abs(userOn10 - item.vote_average);
      if (diff >= 3) hotTakesCount++;
    }
  });

  return {
    avgRating: ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : null,
    hotTakesCount,
  };
}
