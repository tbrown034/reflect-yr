#!/usr/bin/env node

/**
 * Database Migration Runner for Sortid
 *
 * Executes SQL migrations in order from the migrations folder.
 * Tracks completed migrations in a `migrations` table.
 *
 * Usage:
 *   node library/database/migrate.js           # Run all pending migrations
 *   node library/database/migrate.js --status  # Show migration status
 *   node library/database/migrate.js --reset   # Reset migrations table (dev only)
 *
 * Requires DATABASE_URL environment variable to be set.
 */

import { neon } from "@neondatabase/serverless";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOG_PREFIX = "[Migrate]";
const MIGRATIONS_DIR = join(__dirname, "migrations");

// Initialize database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(`${LOG_PREFIX} ERROR: DATABASE_URL environment variable not set`);
  console.error(`${LOG_PREFIX} Set it in .env.local or export it:`);
  console.error(`${LOG_PREFIX}   export DATABASE_URL="postgresql://..."`);
  process.exit(1);
}

const sql = neon(databaseUrl);

/**
 * Ensure the migrations tracking table exists
 */
async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log(`${LOG_PREFIX} Migrations table ready`);
}

/**
 * Get list of already executed migrations
 */
async function getExecutedMigrations() {
  const rows = await sql`SELECT name FROM migrations ORDER BY name`;
  return new Set(rows.map((row) => row.name));
}

/**
 * Get list of migration files from the migrations directory
 */
async function getMigrationFiles() {
  try {
    const files = await readdir(MIGRATIONS_DIR);
    return files
      .filter((f) => f.endsWith(".sql"))
      .sort(); // Alphabetical order ensures 001, 002, etc.
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`${LOG_PREFIX} No migrations directory found at ${MIGRATIONS_DIR}`);
      return [];
    }
    throw err;
  }
}

/**
 * Execute a single migration
 */
async function executeMigration(filename) {
  const filepath = join(MIGRATIONS_DIR, filename);
  const content = await readFile(filepath, "utf-8");

  console.log(`${LOG_PREFIX} Executing: ${filename}`);

  try {
    // Execute the migration SQL
    await sql(content);

    // Record the migration as completed
    await sql`INSERT INTO migrations (name) VALUES (${filename})`;

    console.log(`${LOG_PREFIX} Completed: ${filename}`);
    return true;
  } catch (err) {
    console.error(`${LOG_PREFIX} FAILED: ${filename}`);
    console.error(`${LOG_PREFIX} Error: ${err.message}`);
    throw err;
  }
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
  await ensureMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const migrationFiles = await getMigrationFiles();

  const pendingMigrations = migrationFiles.filter(
    (f) => !executedMigrations.has(f)
  );

  if (pendingMigrations.length === 0) {
    console.log(`${LOG_PREFIX} No pending migrations`);
    return;
  }

  console.log(
    `${LOG_PREFIX} Found ${pendingMigrations.length} pending migration(s)`
  );

  for (const migration of pendingMigrations) {
    await executeMigration(migration);
  }

  console.log(`${LOG_PREFIX} All migrations completed successfully`);
}

/**
 * Show migration status
 */
async function showStatus() {
  await ensureMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const migrationFiles = await getMigrationFiles();

  console.log(`${LOG_PREFIX} Migration Status:`);
  console.log(`${LOG_PREFIX} -----------------`);

  if (migrationFiles.length === 0) {
    console.log(`${LOG_PREFIX} No migration files found`);
    return;
  }

  for (const file of migrationFiles) {
    const status = executedMigrations.has(file) ? "[DONE]" : "[PENDING]";
    console.log(`${LOG_PREFIX} ${status} ${file}`);
  }

  const pendingCount = migrationFiles.filter(
    (f) => !executedMigrations.has(f)
  ).length;
  console.log(`${LOG_PREFIX} -----------------`);
  console.log(
    `${LOG_PREFIX} Total: ${migrationFiles.length}, Pending: ${pendingCount}`
  );
}

/**
 * Reset migrations table (development only)
 */
async function resetMigrations() {
  if (process.env.NODE_ENV === "production") {
    console.error(`${LOG_PREFIX} ERROR: Cannot reset migrations in production`);
    process.exit(1);
  }

  console.log(`${LOG_PREFIX} WARNING: This will reset the migrations tracking table`);
  console.log(`${LOG_PREFIX} The actual tables will NOT be dropped`);
  console.log(`${LOG_PREFIX} Press Ctrl+C to cancel, or wait 3 seconds to continue...`);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  await sql`DROP TABLE IF EXISTS migrations`;
  console.log(`${LOG_PREFIX} Migrations table reset`);
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.includes("--status")) {
      await showStatus();
    } else if (args.includes("--reset")) {
      await resetMigrations();
    } else {
      await runMigrations();
    }
  } catch (err) {
    console.error(`${LOG_PREFIX} Fatal error:`, err.message);
    process.exit(1);
  }
}

main();
