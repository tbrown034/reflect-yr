/**
 * Input validation and sanitization utilities for Sortid
 *
 * These utilities help prevent:
 * - XSS attacks via user-generated content
 * - SQL injection (when used with parameterized queries)
 * - Storage abuse via oversized inputs
 * - Invalid data entering the system
 */

const LOG_PREFIX = "[Validation]";

// =============================================================================
// Constants
// =============================================================================

// Valid list themes (must match LIST_THEMES in ListContext.js)
const VALID_THEMES = [
  "classic",
  "poster-grid",
  "family-feud",
  "awards",
  "minimalist",
];

// Valid list categories (must match CATEGORIES in providers/types.js)
const VALID_CATEGORIES = [
  "movie",
  "tv",
  "book",
  "custom",
];

// Share code character set (excludes confusing characters: 0, 1, I, l, O)
const SHARE_CODE_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const SHARE_CODE_REGEX = new RegExp(`^[${SHARE_CODE_CHARS}]{6}$`);

// Length limits
const LIMITS = {
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 1000,
  COMMENT_MAX: 500,
  ITEMS_MAX: 100,
  YEAR_MIN: 1800,
  YEAR_MAX: 2100,
};

// Hex color regex
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// =============================================================================
// Text Sanitization
// =============================================================================

/**
 * Sanitizes user input text to prevent XSS attacks
 * Removes/escapes potentially dangerous characters while preserving readability
 *
 * @param {string} text - Raw user input
 * @param {Object} options - Sanitization options
 * @param {number} options.maxLength - Maximum allowed length (default: no limit)
 * @param {boolean} options.allowNewlines - Allow newline characters (default: false)
 * @param {boolean} options.trim - Trim whitespace (default: true)
 * @returns {string} Sanitized text
 */
export function sanitizeUserInput(text, options = {}) {
  const { maxLength = 0, allowNewlines = false, trim = true } = options;

  if (text === null || text === undefined) {
    return "";
  }

  // Convert to string if not already
  let sanitized = String(text);

  // Trim whitespace if enabled
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Remove null bytes (potential attack vector)
  sanitized = sanitized.replace(/\0/g, "");

  // Handle newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]+/g, " ");
  }

  // Collapse multiple spaces into one
  sanitized = sanitized.replace(/\s{2,}/g, " ");

  // HTML entity encode dangerous characters
  // This prevents XSS when rendered in HTML contexts
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  // Enforce max length if specified
  if (maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Decodes HTML entities back to original characters
 * Use this when displaying sanitized content in contexts where React handles escaping
 *
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
export function decodeHtmlEntities(text) {
  if (!text) return "";

  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

// =============================================================================
// Share Code Validation
// =============================================================================

/**
 * Validates a share code format
 * Share codes are 6 characters from a restricted character set
 *
 * @param {string} code - Share code to validate
 * @returns {Object} Validation result { valid: boolean, error?: string }
 */
export function validateShareCode(code) {
  if (!code) {
    return { valid: false, error: "Share code is required" };
  }

  if (typeof code !== "string") {
    return { valid: false, error: "Share code must be a string" };
  }

  // Check length
  if (code.length !== 6) {
    return { valid: false, error: "Share code must be exactly 6 characters" };
  }

  // Check character set
  if (!SHARE_CODE_REGEX.test(code)) {
    return { valid: false, error: "Share code contains invalid characters" };
  }

  return { valid: true };
}

/**
 * Checks if a share code is potentially valid (quick check for routing)
 *
 * @param {string} code - Share code to check
 * @returns {boolean} True if format is valid
 */
export function isValidShareCodeFormat(code) {
  return validateShareCode(code).valid;
}

// =============================================================================
// List Input Validation
// =============================================================================

/**
 * Validates and sanitizes list creation/update input
 *
 * @param {Object} data - List data to validate
 * @param {string} data.title - List title
 * @param {string} data.description - List description
 * @param {string} data.type - List type/category
 * @param {string} data.theme - Display theme
 * @param {string} data.accentColor - Hex color code
 * @param {number} data.year - List year
 * @param {boolean} data.isPublic - Public visibility flag
 * @param {Array} data.items - List items
 * @returns {Object} { valid: boolean, data?: sanitizedData, errors?: string[] }
 */
export function validateListInput(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid input data"] };
  }

  const sanitized = {};

  // Title validation (required)
  if (!data.title && data.title !== "") {
    errors.push("Title is required");
  } else {
    sanitized.title = sanitizeUserInput(data.title, {
      maxLength: LIMITS.TITLE_MAX,
    });
    if (sanitized.title.length === 0) {
      errors.push("Title cannot be empty");
    }
  }

  // Description validation (optional)
  if (data.description !== undefined) {
    sanitized.description = sanitizeUserInput(data.description, {
      maxLength: LIMITS.DESCRIPTION_MAX,
      allowNewlines: true,
    });
  }

  // Type/Category validation (required)
  if (!data.type && !data.category) {
    errors.push("List type is required");
  } else {
    const listType = data.category || data.type;
    if (!VALID_CATEGORIES.includes(listType)) {
      errors.push(
        `Invalid list type. Must be one of: ${VALID_CATEGORIES.join(", ")}`
      );
    } else {
      sanitized.type = listType;
      sanitized.category = listType;
    }
  }

  // Theme validation (optional, has default)
  if (data.theme !== undefined) {
    if (!VALID_THEMES.includes(data.theme)) {
      errors.push(
        `Invalid theme. Must be one of: ${VALID_THEMES.join(", ")}`
      );
    } else {
      sanitized.theme = data.theme;
    }
  } else {
    sanitized.theme = "classic";
  }

  // Accent color validation (optional, has default)
  if (data.accentColor !== undefined) {
    if (!HEX_COLOR_REGEX.test(data.accentColor)) {
      errors.push("Accent color must be a valid hex color (e.g., #3B82F6)");
    } else {
      sanitized.accentColor = data.accentColor.toUpperCase();
    }
  } else {
    sanitized.accentColor = "#3B82F6";
  }

  // Year validation (optional)
  if (data.year !== undefined && data.year !== null) {
    const year = parseInt(data.year, 10);
    if (isNaN(year) || year < LIMITS.YEAR_MIN || year > LIMITS.YEAR_MAX) {
      errors.push(
        `Year must be between ${LIMITS.YEAR_MIN} and ${LIMITS.YEAR_MAX}`
      );
    } else {
      sanitized.year = year;
    }
  }

  // isPublic validation (optional, default false)
  sanitized.isPublic = Boolean(data.isPublic);

  // Items validation
  if (data.items !== undefined) {
    if (!Array.isArray(data.items)) {
      errors.push("Items must be an array");
    } else if (data.items.length > LIMITS.ITEMS_MAX) {
      errors.push(`List cannot exceed ${LIMITS.ITEMS_MAX} items`);
    } else {
      // Validate each item
      const itemErrors = [];
      sanitized.items = data.items.map((item, index) => {
        const itemResult = validateItemInput(item);
        if (!itemResult.valid) {
          itemErrors.push(`Item ${index + 1}: ${itemResult.errors.join(", ")}`);
          return item; // Return original on error for debugging
        }
        return itemResult.data;
      });

      if (itemErrors.length > 0) {
        errors.push(...itemErrors);
      }
    }
  }

  if (errors.length > 0) {
    console.warn(`${LOG_PREFIX} List validation failed:`, errors);
    return { valid: false, errors };
  }

  return { valid: true, data: sanitized };
}

// =============================================================================
// Item Input Validation
// =============================================================================

/**
 * Validates and sanitizes a single list item
 *
 * @param {Object} item - Item data to validate
 * @param {string|number} item.id - Item ID
 * @param {string} item.name - Item name/title
 * @param {string} item.comment - User comment
 * @param {number} item.userRating - User rating (1-5)
 * @returns {Object} { valid: boolean, data?: sanitizedItem, errors?: string[] }
 */
export function validateItemInput(item) {
  const errors = [];

  if (!item || typeof item !== "object") {
    return { valid: false, errors: ["Invalid item data"] };
  }

  const sanitized = { ...item };

  // ID validation (required)
  if (item.id === undefined || item.id === null) {
    errors.push("Item ID is required");
  } else {
    // Allow string or number IDs
    const id = item.id;
    if (typeof id === "number") {
      if (!Number.isInteger(id) || id < 0) {
        errors.push("Numeric item ID must be a positive integer");
      }
    } else if (typeof id === "string") {
      // Sanitize string IDs (remove potentially dangerous chars)
      sanitized.id = id.replace(/[<>"'`;]/g, "").substring(0, 100);
      if (sanitized.id.length === 0) {
        errors.push("Item ID cannot be empty");
      }
    } else {
      errors.push("Item ID must be a string or number");
    }
  }

  // Name/Title sanitization (at least one required)
  if (item.name !== undefined) {
    sanitized.name = sanitizeUserInput(item.name, {
      maxLength: LIMITS.TITLE_MAX,
    });
  }
  if (item.title !== undefined) {
    sanitized.title = sanitizeUserInput(item.title, {
      maxLength: LIMITS.TITLE_MAX,
    });
  }
  if (!sanitized.name && !sanitized.title) {
    // Don't error - TMDB items use title, others use name
    // This will be handled by the specific provider
  }

  // Comment sanitization (optional)
  if (item.comment !== undefined && item.comment !== null) {
    sanitized.comment = sanitizeUserInput(item.comment, {
      maxLength: LIMITS.COMMENT_MAX,
      allowNewlines: true,
    });
  }

  // User rating validation (optional, 1-5 or null)
  if (item.userRating !== undefined && item.userRating !== null) {
    const rating = Number(item.userRating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push("User rating must be between 1 and 5");
    } else {
      sanitized.userRating = Math.round(rating); // Ensure integer
    }
  }

  // External ID sanitization (for TMDB, Open Library, etc.)
  if (item.externalId !== undefined) {
    sanitized.externalId = String(item.externalId)
      .replace(/[<>"'`;]/g, "")
      .substring(0, 100);
  }

  // Year validation (if present)
  if (item.year !== undefined && item.year !== null) {
    const year = parseInt(item.year, 10);
    if (
      !isNaN(year) &&
      year >= LIMITS.YEAR_MIN &&
      year <= LIMITS.YEAR_MAX
    ) {
      sanitized.year = year;
    }
    // Don't error on invalid year - just omit it
  }

  // Image URL validation (basic check)
  if (item.image !== undefined) {
    sanitized.image = validateImageUrl(item.image);
  }
  if (item.poster_path !== undefined) {
    sanitized.poster_path = validateImageUrl(item.poster_path);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: sanitized };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Validates an image URL (basic sanitization)
 *
 * @param {string} url - Image URL to validate
 * @returns {string|null} Sanitized URL or null if invalid
 */
function validateImageUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Allow TMDB image paths (start with /)
  if (url.startsWith("/") && !url.includes("..")) {
    return url.substring(0, 200);
  }

  // Allow https URLs from trusted domains
  const trustedDomains = [
    "image.tmdb.org",
    "covers.openlibrary.org",
    "is1-ssl.mzstatic.com", // iTunes
    "cdn.myanimelist.net",
    "www.thesportsdb.com",
  ];

  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === "https:" &&
      trustedDomains.some((domain) => parsed.hostname.endsWith(domain))
    ) {
      return url.substring(0, 500);
    }
  } catch {
    // Invalid URL
  }

  return null;
}

/**
 * Validates a hex color code
 *
 * @param {string} color - Color to validate
 * @returns {boolean} True if valid hex color
 */
export function isValidHexColor(color) {
  return HEX_COLOR_REGEX.test(color);
}

/**
 * Validates that a value is in a list of allowed values
 *
 * @param {*} value - Value to check
 * @param {Array} allowedValues - List of allowed values
 * @returns {boolean} True if value is allowed
 */
export function isAllowedValue(value, allowedValues) {
  return allowedValues.includes(value);
}

/**
 * Validates a TMDB ID (positive integer)
 *
 * @param {*} id - ID to validate
 * @returns {boolean} True if valid TMDB ID
 */
export function isValidTmdbId(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}

/**
 * Validates pagination parameters
 *
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {Object} { page: number, limit: number }
 */
export function validatePagination(params, maxLimit = 100) {
  let page = parseInt(params?.page, 10) || 1;
  let limit = parseInt(params?.limit, 10) || 20;

  // Ensure positive values
  page = Math.max(1, page);
  limit = Math.max(1, Math.min(limit, maxLimit));

  return { page, limit };
}

// =============================================================================
// Exports
// =============================================================================

export {
  VALID_THEMES,
  VALID_CATEGORIES,
  LIMITS,
  HEX_COLOR_REGEX,
  SHARE_CODE_REGEX,
};
