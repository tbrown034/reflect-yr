// library/database/schema.js
// Database schema utilities for user lists
//
// NOTE: Table creation is now handled by migrations.
// Run: pnpm db:migrate
//
// This file provides helper functions for schema checks and validation.

import sql from "./neon.js";

const LOG_PREFIX = "[DB/Schema]";

/**
 * Check if the user_lists table exists (for health checks)
 * @returns {Promise<boolean>}
 */
export async function checkTablesExist() {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'user_lists'
      )
    `;
    return result[0]?.exists || false;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error checking tables:`, error);
    return false;
  }
}

/**
 * Get table stats for debugging
 * @returns {Promise<{lists: number, items: number}>}
 */
export async function getTableStats() {
  try {
    const [listsResult, itemsResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM user_lists WHERE deleted_at IS NULL`,
      sql`SELECT COUNT(*) as count FROM list_items`,
    ]);

    return {
      lists: parseInt(listsResult[0]?.count || "0", 10),
      items: parseInt(itemsResult[0]?.count || "0", 10),
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error getting table stats:`, error);
    return { lists: 0, items: 0 };
  }
}

/**
 * Validate that a user exists in Better Auth's user table
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function validateUser(userId) {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT 1 FROM "user" WHERE id = ${userId}
      )
    `;
    return result[0]?.exists || false;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error validating user:`, error);
    return false;
  }
}

/**
 * Database schema reference (for documentation)
 *
 * user_lists:
 *   - id TEXT PRIMARY KEY
 *   - user_id TEXT NOT NULL (FK -> user.id)
 *   - type TEXT (movie, tv, book, podcast, anime)
 *   - title TEXT
 *   - description TEXT
 *   - theme TEXT DEFAULT 'classic'
 *   - accent_color TEXT DEFAULT '#3B82F6'
 *   - year INTEGER
 *   - share_code TEXT UNIQUE (6-char code)
 *   - is_public BOOLEAN DEFAULT FALSE
 *   - published_at TIMESTAMPTZ
 *   - created_at TIMESTAMPTZ DEFAULT NOW()
 *   - updated_at TIMESTAMPTZ DEFAULT NOW()
 *   - deleted_at TIMESTAMPTZ (soft delete)
 *
 * list_items:
 *   - id TEXT PRIMARY KEY
 *   - list_id TEXT NOT NULL (FK -> user_lists.id CASCADE)
 *   - external_id TEXT (provider's ID)
 *   - provider TEXT (tmdb, openLibrary, jikan, itunes)
 *   - rank INTEGER NOT NULL
 *   - name TEXT NOT NULL
 *   - image TEXT
 *   - year INTEGER
 *   - subtitle TEXT
 *   - metadata JSONB
 *   - user_rating INTEGER (1-5)
 *   - comment TEXT
 *   - created_at TIMESTAMPTZ DEFAULT NOW()
 *   - updated_at TIMESTAMPTZ DEFAULT NOW()
 *
 * Indexes:
 *   - idx_user_lists_user_id ON user_lists(user_id)
 *   - idx_user_lists_share_code ON user_lists(share_code) WHERE share_code IS NOT NULL
 *   - idx_user_lists_deleted_at ON user_lists(deleted_at) WHERE deleted_at IS NULL
 *   - idx_list_items_list_id ON list_items(list_id)
 *   - idx_list_items_list_id_rank ON list_items(list_id, rank)
 */
