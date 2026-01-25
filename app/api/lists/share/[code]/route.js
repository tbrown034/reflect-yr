// app/api/lists/share/[code]/route.js
// API route for fetching public lists by share code

import { NextResponse } from "next/server";
import sql from "@/library/database/neon.js";

const LOG_PREFIX = "[API/lists/share]";

/**
 * GET /api/lists/share/[code]
 * Fetch a public list by share code
 * - No authentication required
 * - Only returns if is_public = true
 */
export async function GET(request, { params }) {
  const { code } = await params;
  console.log(`${LOG_PREFIX} GET - Fetching list by share code: ${code}`);

  try {
    // Validate share code format (6 alphanumeric characters)
    if (!code || code.length !== 6 || !/^[A-Za-z0-9]+$/.test(code)) {
      console.log(`${LOG_PREFIX} GET - Invalid share code format: ${code}`);
      return NextResponse.json(
        { error: "Invalid share code" },
        { status: 400 }
      );
    }

    // Fetch public list by share code
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
      WHERE l.share_code = ${code}
        AND l.is_public = true
        AND l.deleted_at IS NULL
    `;

    if (lists.length === 0) {
      console.log(`${LOG_PREFIX} GET - List not found or not public: ${code}`);
      return NextResponse.json(
        { error: "List not found or is private" },
        { status: 404 }
      );
    }

    const list = lists[0];

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
      WHERE list_id = ${list.id}
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

    console.log(
      `${LOG_PREFIX} GET - Returning public list "${list.title}" with ${items.length} items`
    );

    return NextResponse.json({
      list: {
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
      },
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} GET - Error:`, error);
    return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
  }
}
