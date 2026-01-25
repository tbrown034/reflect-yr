-- Migration: 001_create_lists_tables
-- Description: Create user_lists and list_items tables for cloud sync
-- Created: 2026-01-25
--
-- Note: This replaces the inline schema creation in schema.js with a proper migration.
-- The table is named 'user_lists' to avoid potential conflicts and be more explicit.

-- ============================================================================
-- user_lists table
-- Stores user's media lists (movies, TV, books, podcasts, anime, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_lists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT,
    title TEXT,
    description TEXT,
    theme TEXT DEFAULT 'classic',
    accent_color TEXT DEFAULT '#3B82F6',
    year INTEGER,
    share_code TEXT UNIQUE,
    is_public BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Foreign key to Better Auth's user table
    CONSTRAINT fk_user_lists_user
        FOREIGN KEY (user_id)
        REFERENCES "user"(id)
        ON DELETE CASCADE
);

-- ============================================================================
-- list_items table
-- Stores individual items within a list (movies, shows, books, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS list_items (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL,
    external_id TEXT,
    provider TEXT,
    rank INTEGER NOT NULL,
    name TEXT NOT NULL,
    image TEXT,
    year INTEGER,
    subtitle TEXT,
    metadata JSONB,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key to user_lists with cascade delete
    CONSTRAINT fk_list_items_list
        FOREIGN KEY (list_id)
        REFERENCES user_lists(id)
        ON DELETE CASCADE
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Index for looking up lists by user
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id
    ON user_lists(user_id);

-- Index for looking up lists by share code (public sharing)
CREATE INDEX IF NOT EXISTS idx_user_lists_share_code
    ON user_lists(share_code)
    WHERE share_code IS NOT NULL;

-- Index for filtering non-deleted lists
CREATE INDEX IF NOT EXISTS idx_user_lists_deleted_at
    ON user_lists(deleted_at)
    WHERE deleted_at IS NULL;

-- Index for looking up items by list
CREATE INDEX IF NOT EXISTS idx_list_items_list_id
    ON list_items(list_id);

-- Composite index for getting items in rank order
CREATE INDEX IF NOT EXISTS idx_list_items_list_id_rank
    ON list_items(list_id, rank);

-- ============================================================================
-- Trigger for updated_at timestamps
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_lists
DROP TRIGGER IF EXISTS update_user_lists_updated_at ON user_lists;
CREATE TRIGGER update_user_lists_updated_at
    BEFORE UPDATE ON user_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for list_items
DROP TRIGGER IF EXISTS update_list_items_updated_at ON list_items;
CREATE TRIGGER update_list_items_updated_at
    BEFORE UPDATE ON list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE user_lists IS 'User-created media lists for Sortid cloud sync';
COMMENT ON TABLE list_items IS 'Individual items within a user list';

COMMENT ON COLUMN user_lists.id IS 'Unique list ID (format: list_{timestamp}_{random})';
COMMENT ON COLUMN user_lists.user_id IS 'References Better Auth user.id';
COMMENT ON COLUMN user_lists.type IS 'Media type: movie, tv, book, podcast, anime, etc.';
COMMENT ON COLUMN user_lists.theme IS 'Display theme: classic, posterGrid, familyFeud, awards, minimalist';
COMMENT ON COLUMN user_lists.share_code IS '6-character code for public sharing (avoids ambiguous chars)';
COMMENT ON COLUMN user_lists.deleted_at IS 'Soft delete timestamp (NULL = active)';

COMMENT ON COLUMN list_items.external_id IS 'Provider ID (e.g., TMDB movie ID)';
COMMENT ON COLUMN list_items.provider IS 'Data provider: tmdb, openLibrary, jikan, itunes';
COMMENT ON COLUMN list_items.metadata IS 'Additional provider-specific data as JSON';
COMMENT ON COLUMN list_items.user_rating IS 'User rating 1-5 stars';
