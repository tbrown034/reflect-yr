// library/utils/rateLimit.js
// Simple in-memory rate limiter for AI endpoints
// Can be upgraded to Redis for production multi-instance deployments

const LOG_PREFIX = "[RateLimit]";

/**
 * In-memory store for rate limit tracking
 * Key: rate limit key (e.g., "ai:userId")
 * Value: array of timestamps
 */
const rateLimitMap = new Map();

/**
 * Clean up old entries from the rate limit map
 * Called periodically to prevent memory leaks
 */
function cleanupOldEntries(windowMs = 60000) {
  const now = Date.now();
  const cutoff = now - windowMs;

  for (const [key, timestamps] of rateLimitMap.entries()) {
    const recentTimestamps = timestamps.filter((time) => time > cutoff);
    if (recentTimestamps.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, recentTimestamps);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => cleanupOldEntries(), 5 * 60 * 1000);
}

/**
 * Check and update rate limit for a given key
 * @param {string} key - Unique identifier (e.g., "ai:userId")
 * @param {number} limit - Maximum requests allowed in window (default: 10)
 * @param {number} windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export function rateLimit(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get existing requests within window
  const requests = rateLimitMap.get(key) || [];
  const recentRequests = requests.filter((time) => time > windowStart);

  // Calculate reset time (when oldest request expires)
  const resetIn =
    recentRequests.length > 0
      ? Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      : 0;

  if (recentRequests.length >= limit) {
    console.log(
      `${LOG_PREFIX} Rate limit exceeded for key: ${key} (${recentRequests.length}/${limit})`
    );
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);

  const remaining = limit - recentRequests.length;
  console.log(`${LOG_PREFIX} Request allowed for key: ${key} (${remaining} remaining)`);

  return {
    allowed: true,
    remaining,
    resetIn,
  };
}

/**
 * Clear rate limit for a specific key (useful for testing)
 * @param {string} key - Key to clear
 */
export function clearRateLimit(key) {
  rateLimitMap.delete(key);
}

/**
 * Get current rate limit status without incrementing
 * @param {string} key - Key to check
 * @param {number} limit - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ count: number, remaining: number, resetIn: number }}
 */
export function getRateLimitStatus(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  const requests = rateLimitMap.get(key) || [];
  const recentRequests = requests.filter((time) => time > windowStart);

  const resetIn =
    recentRequests.length > 0
      ? Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      : 0;

  return {
    count: recentRequests.length,
    remaining: Math.max(0, limit - recentRequests.length),
    resetIn,
  };
}
