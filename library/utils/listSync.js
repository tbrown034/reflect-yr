// library/utils/listSync.js
// Database sync utilities for user lists
// Handles syncing lists between localStorage and Neon PostgreSQL

const LOG_PREFIX = "[ListSync]";

/**
 * Fetch all lists for the current user from the database
 * @returns {Promise<{lists: Array, error: string|null}>}
 */
export async function fetchUserLists() {
  console.log(`${LOG_PREFIX} Fetching user lists from database...`);

  try {
    const response = await fetch("/api/lists", {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
      console.log(`${LOG_PREFIX} Not authenticated - using localStorage only`);
      return { lists: null, error: null }; // Not an error, just not logged in
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`${LOG_PREFIX} Fetched ${data.lists?.length || 0} lists from database`);
    return { lists: data.lists || [], error: null };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching lists:`, error);
    return { lists: null, error: error.message };
  }
}

/**
 * Create a new list in the database
 * @param {Object} listData - List data to create
 * @returns {Promise<{list: Object|null, error: string|null}>}
 */
export async function createListInDatabase(listData) {
  console.log(`${LOG_PREFIX} Creating list in database:`, listData.title);

  try {
    const response = await fetch("/api/lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(listData),
    });

    if (response.status === 401) {
      console.log(`${LOG_PREFIX} Not authenticated - list saved to localStorage only`);
      return { list: null, error: null }; // Not an error, just not logged in
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`${LOG_PREFIX} Created list in database: ${data.list?.id}`);
    return { list: data.list, error: null };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error creating list:`, error);
    return { list: null, error: error.message };
  }
}

/**
 * Update a list in the database
 * @param {string} listId - List ID to update
 * @param {Object} updates - Fields to update (title, description, theme, accentColor, isPublic, items)
 * @returns {Promise<{list: Object|null, error: string|null}>}
 */
export async function updateListInDatabase(listId, updates) {
  console.log(`${LOG_PREFIX} Updating list in database: ${listId}`);

  try {
    const response = await fetch(`/api/lists/${listId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updates),
    });

    if (response.status === 401) {
      console.log(`${LOG_PREFIX} Not authenticated - update saved to localStorage only`);
      return { list: null, error: null };
    }

    if (response.status === 404) {
      console.log(`${LOG_PREFIX} List not found in database - may be localStorage only`);
      return { list: null, error: null };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`${LOG_PREFIX} Updated list in database: ${listId}`);
    return { list: data.list, error: null };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error updating list:`, error);
    return { list: null, error: error.message };
  }
}

/**
 * Delete a list from the database
 * @param {string} listId - List ID to delete
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteListFromDatabase(listId) {
  console.log(`${LOG_PREFIX} Deleting list from database: ${listId}`);

  try {
    const response = await fetch(`/api/lists/${listId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.status === 401) {
      console.log(`${LOG_PREFIX} Not authenticated - deleted from localStorage only`);
      return { success: true, error: null }; // Still succeed for localStorage
    }

    if (response.status === 404) {
      console.log(`${LOG_PREFIX} List not found in database - may be localStorage only`);
      return { success: true, error: null };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    console.log(`${LOG_PREFIX} Deleted list from database: ${listId}`);
    return { success: true, error: null };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error deleting list:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch a single list by ID from the database
 * @param {string} listId - List ID to fetch
 * @returns {Promise<{list: Object|null, error: string|null}>}
 */
export async function fetchListById(listId) {
  console.log(`${LOG_PREFIX} Fetching list from database: ${listId}`);

  try {
    const response = await fetch(`/api/lists/${listId}`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 404) {
      return { list: null, error: null };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { list: data.list, error: null };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching list:`, error);
    return { list: null, error: error.message };
  }
}

/**
 * Fetch a public list by share code
 * @param {string} shareCode - 6-character share code
 * @returns {Promise<{list: Object|null, error: string|null}>}
 */
export async function fetchListByShareCode(shareCode) {
  console.log(`${LOG_PREFIX} Fetching list by share code: ${shareCode}`);

  try {
    const response = await fetch(`/api/lists/share/${shareCode}`, {
      method: "GET",
    });

    if (response.status === 404) {
      return { list: null, error: "List not found" };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { list: data.list, error: null };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching list by share code:`, error);
    return { list: null, error: error.message };
  }
}

/**
 * Merge database lists with localStorage lists
 * Database takes priority for lists with the same ID
 * @param {Object} localLists - Lists from localStorage (keyed by ID)
 * @param {Array} dbLists - Lists from database (array)
 * @returns {Object} Merged lists keyed by ID
 */
export function mergeListsWithDatabase(localLists, dbLists) {
  const merged = { ...localLists };

  // Database lists take priority
  for (const dbList of dbLists) {
    merged[dbList.id] = {
      ...dbList,
      syncedAt: new Date().toISOString(),
      syncedFromDb: true,
    };
  }

  console.log(
    `${LOG_PREFIX} Merged ${Object.keys(localLists).length} local + ${dbLists.length} database lists = ${Object.keys(merged).length} total`
  );

  return merged;
}

/**
 * Identify lists that exist in localStorage but not in database (for sync)
 * @param {Object} localLists - Lists from localStorage
 * @param {Array} dbLists - Lists from database
 * @returns {Array} List objects that need to be synced to database
 */
export function getUnsyncedLists(localLists, dbLists) {
  const dbIds = new Set(dbLists.map((l) => l.id));
  const unsynced = Object.values(localLists).filter(
    (list) => !dbIds.has(list.id) && !list.syncedAt
  );

  console.log(`${LOG_PREFIX} Found ${unsynced.length} unsynced lists`);
  return unsynced;
}

/**
 * Sync a local list to the database
 * @param {Object} list - List to sync
 * @returns {Promise<{success: boolean, list: Object|null}>}
 */
export async function syncListToDatabase(list) {
  console.log(`${LOG_PREFIX} Syncing list to database: ${list.id}`);

  // Prepare list data for API
  const listData = {
    type: list.type || list.category,
    title: list.title,
    description: list.description || "",
    theme: list.theme || "classic",
    accentColor: list.accentColor || "#3B82F6",
    year: list.year,
    isPublic: list.isPublic !== false,
    items: list.items.map((item) => ({
      id: item.id,
      externalId: item.externalId || item.id,
      provider: item.provider || "tmdb",
      name: item.name || item.title,
      image: item.image || item.poster_path,
      year: item.year,
      subtitle: item.subtitle,
      metadata: item.metadata || {},
      userRating: item.userRating,
      comment: item.comment || "",
    })),
  };

  const result = await createListInDatabase(listData);

  if (result.list) {
    return { success: true, list: result.list };
  }

  return { success: false, list: null };
}
