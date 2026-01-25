// app/api/lists/route.js
// API routes for user lists - GET all lists, POST create new list

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/library/auth";
import sql from "@/library/database/neon.js";
import { generateListId, generateShareCode } from "@/library/utils/listUtils";

const LOG_PREFIX = "[API/lists]";

/**
 * Generate a unique ID for list items
 */
function generateItemId() {
  return `item_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * GET /api/lists
 * Fetch all lists for the logged-in user
 */
export async function GET(_request) {
  console.log(`${LOG_PREFIX} GET - Fetching user lists`);

  try {
    // Get session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      console.log(`${LOG_PREFIX} GET - Unauthorized: No session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`${LOG_PREFIX} GET - User ID: ${userId}`);

    // Fetch lists with items
    const lists = await sql`
      SELECT
        l.id,
        l.type,
        l.title,
        l.description,
        l.theme,
        l.accent_color AS "accentColor",
        l.year,
        l.share_code AS "shareCode",
        l.is_public AS "isPublic",
        l.published_at AS "publishedAt",
        l.updated_at AS "updatedAt"
      FROM user_lists l
      WHERE l.user_id = ${userId}
        AND l.deleted_at IS NULL
      ORDER BY l.updated_at DESC
    `;

    // Fetch items for all lists
    const listIds = lists.map((l) => l.id);

    let itemsByList = {};
    if (listIds.length > 0) {
      const items = await sql`
        SELECT
          id,
          list_id AS "listId",
          external_id AS "externalId",
          provider,
          rank,
          name,
          image,
          year,
          subtitle,
          metadata,
          user_rating AS "userRating",
          comment
        FROM list_items
        WHERE list_id = ANY(${listIds})
        ORDER BY rank ASC
      `;

      // Group items by list
      items.forEach((item) => {
        if (!itemsByList[item.listId]) {
          itemsByList[item.listId] = [];
        }
        // Parse metadata if it's a string
        const metadata =
          typeof item.metadata === "string"
            ? JSON.parse(item.metadata)
            : item.metadata || {};

        itemsByList[item.listId].push({
          id: item.externalId,
          externalId: item.externalId,
          provider: item.provider,
          rank: item.rank,
          name: item.name,
          title: item.name, // Backwards compatibility
          image: item.image,
          poster_path: item.image, // Backwards compatibility
          year: item.year,
          subtitle: item.subtitle,
          metadata,
          userRating: item.userRating ? parseInt(item.userRating, 10) : null,
          comment: item.comment,
        });
      });
    }

    // Attach items to lists
    const listsWithItems = lists.map((list) => ({
      ...list,
      items: itemsByList[list.id] || [],
    }));

    console.log(`${LOG_PREFIX} GET - Returning ${lists.length} lists`);
    return NextResponse.json({ lists: listsWithItems });
  } catch (error) {
    console.error(`${LOG_PREFIX} GET - Error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lists
 * Create a new list
 */
export async function POST(request) {
  console.log(`${LOG_PREFIX} POST - Creating new list`);

  try {
    // Get session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      console.log(`${LOG_PREFIX} POST - Unauthorized: No session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const {
      type,
      title,
      description = "",
      theme = "classic",
      accentColor = "#3B82F6",
      year,
      items = [],
      isPublic = true,
    } = body;

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { error: "List type is required" },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "List title is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "List must have at least one item" },
        { status: 400 }
      );
    }

    // Generate unique ID and share code
    const listId = generateListId();
    let shareCode = generateShareCode();

    // Ensure share code is unique (retry if collision)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await sql`
        SELECT id FROM user_lists WHERE share_code = ${shareCode}
      `;
      if (existing.length === 0) break;
      shareCode = generateShareCode();
      attempts++;
    }

    console.log(
      `${LOG_PREFIX} POST - Creating list: ${listId} (shareCode: ${shareCode})`
    );

    const now = new Date().toISOString();

    // Insert list
    await sql`
      INSERT INTO user_lists (
        id,
        user_id,
        type,
        title,
        description,
        theme,
        accent_color,
        year,
        share_code,
        is_public,
        published_at,
        created_at,
        updated_at
      ) VALUES (
        ${listId},
        ${userId},
        ${type},
        ${title.trim()},
        ${description || ""},
        ${theme},
        ${accentColor},
        ${year || null},
        ${shareCode},
        ${isPublic},
        ${now},
        ${now},
        ${now}
      )
    `;

    // Insert items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemId = generateItemId();
      const externalId = String(item.externalId || item.id);
      const provider = item.provider || "tmdb";
      const name = item.name || item.title || "Untitled";
      const image = item.image || item.poster_path || null;
      const itemYear = item.year || null;
      const subtitle = item.subtitle || null;
      const metadata = item.metadata || {};
      const userRating = item.userRating || null;
      const comment = item.comment || "";

      await sql`
        INSERT INTO list_items (
          id,
          list_id,
          external_id,
          provider,
          rank,
          name,
          image,
          year,
          subtitle,
          metadata,
          user_rating,
          comment,
          created_at,
          updated_at
        ) VALUES (
          ${itemId},
          ${listId},
          ${externalId},
          ${provider},
          ${i + 1},
          ${name},
          ${image},
          ${itemYear},
          ${subtitle},
          ${JSON.stringify(metadata)},
          ${userRating},
          ${comment},
          ${now},
          ${now}
        )
      `;
    }

    console.log(`${LOG_PREFIX} POST - List created with ${items.length} items`);

    // Return created list
    return NextResponse.json(
      {
        list: {
          id: listId,
          type,
          title: title.trim(),
          description,
          theme,
          accentColor,
          year,
          shareCode,
          isPublic,
          publishedAt: now,
          updatedAt: now,
          items: items.map((item, index) => ({
            id: item.externalId || item.id,
            externalId: item.externalId || item.id,
            provider: item.provider || "tmdb",
            rank: index + 1,
            name: item.name || item.title,
            title: item.name || item.title,
            image: item.image || item.poster_path,
            poster_path: item.image || item.poster_path,
            year: item.year,
            subtitle: item.subtitle,
            metadata: item.metadata || {},
            userRating: item.userRating,
            comment: item.comment || "",
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`${LOG_PREFIX} POST - Error:`, error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
