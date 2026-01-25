/**
 * Test utilities for cloud sync feature testing
 *
 * Provides helper functions for:
 * - Creating test lists
 * - Creating test users
 * - Cleaning up test data
 * - Asserting API responses
 */

import { generateListId, generateShareCode } from "../utils/listUtils";

const LOG_PREFIX = "[TestUtils]";

// Track created test data for cleanup
const createdListIds = new Set();
const createdUserIds = new Set();

/**
 * Default test list data
 */
export const DEFAULT_LIST = {
  type: "movie",
  title: "Test Movie List",
  description: "A list created for testing purposes",
  theme: "classic",
  accentColor: "#3B82F6",
  year: 2024,
  isPublic: true,
  items: [
    {
      id: 693134,
      title: "Dune: Part Two",
      poster_path: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
      release_date: "2024-02-27",
      vote_average: 8.3,
      rank: 1,
      userRating: 5,
      comment: "Incredible sequel",
    },
    {
      id: 872585,
      title: "Oppenheimer",
      poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      release_date: "2023-07-19",
      vote_average: 8.1,
      rank: 2,
      userRating: 5,
      comment: "Masterpiece",
    },
    {
      id: 346698,
      title: "Barbie",
      poster_path: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
      release_date: "2023-07-19",
      vote_average: 7.0,
      rank: 3,
      userRating: 4,
      comment: "",
    },
  ],
};

/**
 * Default test user data
 */
export const DEFAULT_USER = {
  email: "testuser@example.com",
  name: "Test User",
  image: "https://example.com/avatar.png",
};

/**
 * Creates a test list with optional overrides
 *
 * @param {string|null} userId - Owner user ID (null for anonymous)
 * @param {object} overrides - Properties to override default values
 * @returns {object} Created list object
 */
export function createTestList(userId = null, overrides = {}) {
  const listId = generateListId();
  const shareCode = generateShareCode();

  const list = {
    ...DEFAULT_LIST,
    id: listId,
    shareCode,
    userId,
    publishedAt: new Date().toISOString(),
    syncedAt: userId ? new Date().toISOString() : null,
    pendingSync: false,
    ...overrides,
    // Ensure items have ranks
    items: (overrides.items || DEFAULT_LIST.items).map((item, index) => ({
      ...item,
      rank: index + 1,
    })),
  };

  createdListIds.add(listId);
  console.log(`${LOG_PREFIX} Created test list: ${listId}`);

  return list;
}

/**
 * Creates a test list for localStorage
 *
 * @param {object} overrides - Properties to override default values
 * @returns {object} List suitable for localStorage storage
 */
export function createLocalStorageList(overrides = {}) {
  return createTestList(null, {
    ...overrides,
    syncedAt: null,
    pendingSync: false,
  });
}

/**
 * Creates a test list that simulates pending sync state
 *
 * @param {string} userId - Owner user ID
 * @param {object} overrides - Properties to override
 * @returns {object} List with pendingSync: true
 */
export function createPendingSyncList(userId, overrides = {}) {
  return createTestList(userId, {
    ...overrides,
    pendingSync: true,
    syncedAt: null,
  });
}

/**
 * Creates a minimal test list (fewer items, less data)
 *
 * @param {object} overrides - Properties to override
 * @returns {object} Minimal list object
 */
export function createMinimalTestList(overrides = {}) {
  return createTestList(null, {
    items: [
      {
        id: 693134,
        title: "Test Movie",
        rank: 1,
      },
    ],
    ...overrides,
  });
}

/**
 * Creates a test user object
 *
 * @param {object} overrides - Properties to override default values
 * @returns {object} User object
 */
export function createTestUser(overrides = {}) {
  const userId = `user_test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const user = {
    id: userId,
    ...DEFAULT_USER,
    ...overrides,
    createdAt: new Date().toISOString(),
  };

  createdUserIds.add(userId);
  console.log(`${LOG_PREFIX} Created test user: ${userId}`);

  return user;
}

/**
 * Creates a mock session object for authenticated user testing
 *
 * @param {object} user - User object (from createTestUser)
 * @returns {object} Session object compatible with Better Auth
 */
export function createMockSession(user) {
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
    session: {
      id: `session_${Date.now()}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

/**
 * Cleans up test data from localStorage
 *
 * @param {object} options - Cleanup options
 * @param {boolean} options.lists - Clear publishedLists
 * @param {boolean} options.recommendations - Clear recommendationLists
 * @param {boolean} options.tempLists - Clear tempLists
 * @param {boolean} options.watchedPool - Clear watchedPool
 * @param {boolean} options.all - Clear everything
 */
export function cleanupLocalStorage(options = { all: true }) {
  if (typeof window === "undefined") {
    console.log(`${LOG_PREFIX} Not in browser, skipping localStorage cleanup`);
    return;
  }

  if (options.all || options.lists) {
    localStorage.removeItem("publishedLists");
    localStorage.removeItem("userMovieList");
    localStorage.removeItem("userTvList");
  }

  if (options.all || options.recommendations) {
    localStorage.removeItem("recommendationLists");
  }

  if (options.all || options.tempLists) {
    localStorage.removeItem("tempLists");
  }

  if (options.all || options.watchedPool) {
    localStorage.removeItem("watchedPool");
  }

  console.log(`${LOG_PREFIX} Cleaned up localStorage`);
}

/**
 * Cleans up test data from database (requires API endpoint)
 * Should be called in test teardown
 *
 * @param {object} options - Cleanup options
 * @returns {Promise<void>}
 */
export async function cleanupDatabase(options = {}) {
  const { apiBase = "" } = options;

  // Clean up lists
  for (const listId of createdListIds) {
    try {
      await fetch(`${apiBase}/api/lists/${listId}`, {
        method: "DELETE",
        headers: {
          "X-Test-Cleanup": "true",
        },
      });
    } catch (error) {
      console.warn(`${LOG_PREFIX} Failed to cleanup list ${listId}:`, error.message);
    }
  }
  createdListIds.clear();

  // Clean up users (if test cleanup endpoint exists)
  for (const userId of createdUserIds) {
    try {
      await fetch(`${apiBase}/api/test/cleanup-user/${userId}`, {
        method: "DELETE",
        headers: {
          "X-Test-Cleanup": "true",
        },
      });
    } catch (error) {
      // Users may not have a cleanup endpoint
      console.warn(`${LOG_PREFIX} User cleanup not available for ${userId}`);
    }
  }
  createdUserIds.clear();

  console.log(`${LOG_PREFIX} Database cleanup complete`);
}

/**
 * Cleans up all test data (localStorage + database)
 *
 * @param {object} options - Cleanup options
 * @returns {Promise<void>}
 */
export async function cleanupTestData(options = {}) {
  cleanupLocalStorage({ all: true });
  await cleanupDatabase(options);
}

/**
 * Asserts that an API response matches expected values
 *
 * @param {Response} response - Fetch Response object
 * @param {number} expectedStatus - Expected HTTP status code
 * @param {object} expectedBody - Expected response body (partial match)
 * @returns {Promise<object>} Parsed response body
 * @throws {Error} If assertions fail
 */
export async function assertApiResponse(response, expectedStatus, expectedBody = null) {
  // Check status code
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. Body: ${body}`
    );
  }

  // Parse and check body if expected
  if (expectedBody !== null) {
    const body = await response.json();
    assertObjectMatch(body, expectedBody);
    return body;
  }

  return null;
}

/**
 * Helper to check if an object matches expected values (partial match)
 *
 * @param {object} actual - Actual object
 * @param {object} expected - Expected values
 * @throws {Error} If match fails
 */
function assertObjectMatch(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (!(key in actual)) {
      throw new Error(`Missing expected key: ${key}`);
    }

    if (typeof value === "object" && value !== null) {
      if (value.asymmetricMatch) {
        // Jest matcher (e.g., expect.any, expect.arrayContaining)
        if (!value.asymmetricMatch(actual[key])) {
          throw new Error(`Key "${key}" did not match expected pattern`);
        }
      } else if (Array.isArray(value)) {
        if (!Array.isArray(actual[key])) {
          throw new Error(`Expected key "${key}" to be an array`);
        }
        if (actual[key].length !== value.length) {
          throw new Error(
            `Expected array length ${value.length}, got ${actual[key].length}`
          );
        }
      } else {
        assertObjectMatch(actual[key], value);
      }
    } else if (actual[key] !== value) {
      throw new Error(
        `Expected ${key} to be ${JSON.stringify(value)}, got ${JSON.stringify(actual[key])}`
      );
    }
  }
}

/**
 * Asserts that an API call returns an error
 *
 * @param {Response} response - Fetch Response object
 * @param {number} expectedStatus - Expected error status (4xx or 5xx)
 * @param {string} expectedMessage - Expected error message (partial match)
 * @returns {Promise<object>} Error response body
 */
export async function assertApiError(response, expectedStatus, expectedMessage = null) {
  if (response.status !== expectedStatus) {
    throw new Error(`Expected error status ${expectedStatus}, got ${response.status}`);
  }

  const body = await response.json();

  if (expectedMessage && !body.error?.includes(expectedMessage)) {
    throw new Error(
      `Expected error message containing "${expectedMessage}", got "${body.error}"`
    );
  }

  return body;
}

/**
 * Waits for a condition to be true (useful for async operations)
 *
 * @param {function} conditionFn - Function that returns boolean
 * @param {number} timeout - Max wait time in ms
 * @param {number} interval - Check interval in ms
 * @returns {Promise<void>}
 */
export async function waitFor(conditionFn, timeout = 5000, interval = 100) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await conditionFn()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Simulates offline mode for testing
 *
 * @param {function} testFn - Test function to run while "offline"
 * @returns {Promise<*>} Result of testFn
 */
export async function simulateOffline(testFn) {
  const originalFetch = global.fetch;

  // Replace fetch to simulate network failure
  global.fetch = () =>
    Promise.reject(new Error("Network request failed (simulated offline)"));

  try {
    return await testFn();
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Simulates slow network for testing loading states
 *
 * @param {function} testFn - Test function to run
 * @param {number} delay - Delay in ms
 * @returns {Promise<*>} Result of testFn
 */
export async function simulateSlowNetwork(testFn, delay = 2000) {
  const originalFetch = global.fetch;

  global.fetch = async (...args) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return originalFetch(...args);
  };

  try {
    return await testFn();
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Creates a mock for the authClient
 *
 * @param {object} sessionData - Session data to return
 * @returns {object} Mock authClient
 */
export function createMockAuthClient(sessionData = null) {
  return {
    getSession: jest.fn().mockResolvedValue(sessionData),
    signIn: {
      social: jest.fn().mockResolvedValue({ url: "/mock-oauth" }),
    },
    signOut: jest.fn().mockResolvedValue({}),
    useSession: jest.fn().mockReturnValue({
      data: sessionData,
      isPending: false,
      error: null,
    }),
  };
}

/**
 * Gets the current lists from localStorage (for verification)
 *
 * @returns {object} Published lists object
 */
export function getLocalStorageLists() {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("publishedLists");
  return stored ? JSON.parse(stored) : {};
}

/**
 * Sets lists directly in localStorage (for test setup)
 *
 * @param {object} lists - Lists object keyed by ID
 */
export function setLocalStorageLists(lists) {
  if (typeof window === "undefined") return;
  localStorage.setItem("publishedLists", JSON.stringify(lists));
}

/**
 * Adds a single list to localStorage
 *
 * @param {object} list - List object with id property
 */
export function addListToLocalStorage(list) {
  const lists = getLocalStorageLists();
  lists[list.id] = list;
  setLocalStorageLists(lists);
}

/**
 * Generates test data for stress testing
 *
 * @param {number} count - Number of lists to generate
 * @returns {object} Object with list IDs as keys
 */
export function generateBulkTestLists(count = 10) {
  const lists = {};

  for (let i = 0; i < count; i++) {
    const list = createTestList(null, {
      title: `Bulk Test List ${i + 1}`,
    });
    lists[list.id] = list;
  }

  return lists;
}

// Export all utilities
export default {
  DEFAULT_LIST,
  DEFAULT_USER,
  createTestList,
  createLocalStorageList,
  createPendingSyncList,
  createMinimalTestList,
  createTestUser,
  createMockSession,
  cleanupLocalStorage,
  cleanupDatabase,
  cleanupTestData,
  assertApiResponse,
  assertApiError,
  waitFor,
  simulateOffline,
  simulateSlowNetwork,
  createMockAuthClient,
  getLocalStorageLists,
  setLocalStorageLists,
  addListToLocalStorage,
  generateBulkTestLists,
};
