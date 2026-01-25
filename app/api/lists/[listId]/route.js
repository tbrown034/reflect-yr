// app/api/lists/[listId]/route.js
// API routes for single list operations - GET, PUT, DELETE

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/library/auth";
import sql from "@/library/database/neon.js";

const LOG_PREFIX = "[API/lists/[listId]]";

/**
 * Generate a unique ID for list items
 */
function generateItemId() {
  return `item_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * GET /api/lists/[listId]
 * Fetch a single list by ID
 * - Auth required if list is private
 * - Returns list with items
 */
export async function GET(request, { params }) {
  const { listId } = await params;
  console.log(`${LOG_PREFIX} GET - Fetching list: ${listId}`);

  try {
    // Get session (optional - needed for private lists)
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    // Fetch list
    const lists = await sql`
      SELECT
        l.id,
        l.user_id AS "userId",
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
      WHERE l.id = ${listId}
        AND l.deleted_at IS NULL
    `;

    if (lists.length === 0) {
      console.log(`${LOG_PREFIX} GET - List not found: ${listId}`);
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const list = lists[0];

    // Check access permissions
    const isOwner = userId && list.userId === userId;
    if (!list.isPublic && !isOwner) {
      console.log(`${LOG_PREFIX} GET - Access denied to private list: ${listId}`);
      return NextResponse.json(
        { error: "Access denied. This list is private." },
        { status: 403 }
      );
    }

    // Fetch items
    const items = await sql`
      SELECT
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
      WHERE list_id = ${listId}
      ORDER BY rank ASC
    `;

    // Format items with backwards compatibility
    const formattedItems = items.map((item) => {
      const metadata =
        typeof item.metadata === "string"
          ? JSON.parse(item.metadata)
          : item.metadata || {};

      return {
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
      };
    });

    console.log(`${LOG_PREFIX} GET - Returning list with ${items.length} items`);

    // Remove userId from response for non-owners
    const responseList = {
      id: list.id,
      type: list.type,
      title: list.title,
      description: list.description,
      theme: list.theme,
      accentColor: list.accentColor,
      year: list.year,
      shareCode: list.shareCode,
      isPublic: list.isPublic,
      publishedAt: list.publishedAt,
      updatedAt: list.updatedAt,
      items: formattedItems,
      isOwner, // Useful for UI
    };

    return NextResponse.json({ list: responseList });
  } catch (error) {
    console.error(`${LOG_PREFIX} GET - Error:`, error);
    return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
  }
}

/**
 * PUT /api/lists/[listId]
 * Update list metadata and/or items
 * - Auth required (must be owner)
 */
export async function PUT(request, { params }) {
  const { listId } = await params;
  console.log(`${LOG_PREFIX} PUT - Updating list: ${listId}`);

  try {
    // Get session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      console.log(`${LOG_PREFIX} PUT - Unauthorized: No session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verify ownership
    const lists = await sql`
      SELECT id, user_id AS "userId"
      FROM user_lists
      WHERE id = ${listId}
        AND deleted_at IS NULL
    `;

    if (lists.length === 0) {
      console.log(`${LOG_PREFIX} PUT - List not found: ${listId}`);
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    if (lists[0].userId !== userId) {
      console.log(`${LOG_PREFIX} PUT - Forbidden: Not owner`);
      return NextResponse.json(
        { error: "You do not have permission to update this list" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, theme, accentColor, isPublic, items } = body;

    // Validate title if provided
    if (title !== undefined && title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Update metadata using COALESCE to only update provided fields
    await sql`
      UPDATE user_lists
      SET
        title = COALESCE(${title !== undefined ? title.trim() : null}, title),
        description = COALESCE(${description !== undefined ? description : null}, description),
        theme = COALESCE(${theme !== undefined ? theme : null}, theme),
        accent_color = COALESCE(${accentColor !== undefined ? accentColor : null}, accent_color),
        is_public = COALESCE(${isPublic !== undefined ? isPublic : null}, is_public),
        updated_at = ${now}
      WHERE id = ${listId}
    `;
    console.log(`${LOG_PREFIX} PUT - Updated metadata`);

    // Update items if provided
    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return NextResponse.json(
          { error: "Items must be an array" },
          { status: 400 }
        );
      }

      if (items.length === 0) {
        return NextResponse.json(
          { error: "List must have at least one item" },
          { status: 400 }
        );
      }

      // Delete existing items
      await sql`
        DELETE FROM list_items WHERE list_id = ${listId}
      `;

      // Insert new items
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

      console.log(`${LOG_PREFIX} PUT - Updated ${items.length} items`);
    }

    // Fetch updated list
    const updatedLists = await sql`
      SELECT
        id,
        type,
        title,
        description,
        theme,
        accent_color AS "accentColor",
        year,
        share_code AS "shareCode",
        is_public AS "isPublic",
        published_at AS "publishedAt",
        updated_at AS "updatedAt"
      FROM user_lists
      WHERE id = ${listId}
    `;

    const updatedItems = await sql`
      SELECT
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
      WHERE list_id = ${listId}
      ORDER BY rank ASC
    `;

    const formattedItems = updatedItems.map((item) => {
      const metadata =
        typeof item.metadata === "string"
          ? JSON.parse(item.metadata)
          : item.metadata || {};

      return {
        id: item.externalId,
        externalId: item.externalId,
        provider: item.provider,
        rank: item.rank,
        name: item.name,
        title: item.name,
        image: item.image,
        poster_path: item.image,
        year: item.year,
        subtitle: item.subtitle,
        metadata,
        userRating: item.userRating ? parseInt(item.userRating, 10) : null,
        comment: item.comment,
      };
    });

    console.log(`${LOG_PREFIX} PUT - Update complete`);

    return NextResponse.json({
      list: {
        ...updatedLists[0],
        items: formattedItems,
      },
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} PUT - Error:`, error);
    return NextResponse.json({ error: "Failed to update list" }, { status: 500 });
  }
}

/**
 * DELETE /api/lists/[listId]
 * Soft delete a list (sets deleted_at timestamp)
 * - Auth required (must be owner)
 */
export async function DELETE(request, { params }) {
  const { listId } = await params;
  console.log(`${LOG_PREFIX} DELETE - Deleting list: ${listId}`);

  try {
    // Get session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      console.log(`${LOG_PREFIX} DELETE - Unauthorized: No session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verify ownership
    const lists = await sql`
      SELECT id, user_id AS "userId"
      FROM user_lists
      WHERE id = ${listId}
        AND deleted_at IS NULL
    `;

    if (lists.length === 0) {
      console.log(`${LOG_PREFIX} DELETE - List not found: ${listId}`);
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    if (lists[0].userId !== userId) {
      console.log(`${LOG_PREFIX} DELETE - Forbidden: Not owner`);
      return NextResponse.json(
        { error: "You do not have permission to delete this list" },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // Soft delete
    await sql`
      UPDATE user_lists
      SET deleted_at = ${now}, updated_at = ${now}
      WHERE id = ${listId}
    `;

    console.log(`${LOG_PREFIX} DELETE - List soft deleted: ${listId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`${LOG_PREFIX} DELETE - Error:`, error);
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 });
  }
}
