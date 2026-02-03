import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/library/auth";
import { rateLimit } from "@/library/utils/rateLimit";
import { formatRecommendationPrompt } from "@/library/utils/recommendationsUtils";
import { searchTmdbByTitle } from "@/library/api/tmdb";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const LOG_PREFIX = "[Recommendations API]";

// Valid media types for recommendations
const VALID_TYPES = ["movie", "tv"];

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      console.log(`${LOG_PREFIX} Unauthorized: No session`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Apply rate limiting (10 requests per minute per user)
    const { allowed, remaining, resetIn } = rateLimit(
      `ai:recommendations:${session.user.id}`,
      10,
      60000
    );

    if (!allowed) {
      console.log(`${LOG_PREFIX} Rate limit exceeded for user: ${session.user.id}`);
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(resetIn),
          },
        }
      );
    }

    const { listId, type, items } = await request.json();

    // Validate required fields
    if (!listId || !type || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid data" },
        { status: 400 }
      );
    }

    // Validate type parameter
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const prompt = formatRecommendationPrompt(type, items);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const contentType = anthropicRes.headers.get("content-type") || "";

    if (!anthropicRes.ok) {
      const errorText = contentType.includes("application/json")
        ? JSON.stringify(await anthropicRes.json())
        : await anthropicRes.text();

      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "Ruh-roh! Scooby couldn’t fetch recommendations." },
        { status: anthropicRes.status }
      );
    }

    const data = contentType.includes("application/json")
      ? await anthropicRes.json()
      : (() => {
          console.warn("Non-JSON response from Anthropic.");
          return {};
        })();

    const recommendationsText = data?.content?.[0]?.text ?? "";
    const recommendations = parseRecommendations(recommendationsText, type);

    if (!recommendations.length) {
      console.warn("No recommendations parsed from model response.");
      return NextResponse.json({ recommendations: [] }, { status: 200 });
    }

    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const title = rec.title || rec.name;
          const mediaType = type === "movie" ? "movie" : "tv";
          const tmdbResults = await searchTmdbByTitle(
            title,
            rec.year,
            mediaType
          );

          if (tmdbResults?.length > 0) {
            const bestMatch = tmdbResults[0];
            return {
              ...bestMatch,
              reason: rec.reason,
              fromRecommendation: true,
            };
          }

          return rec; // fallback to raw recommendation
        } catch (tmdbErr) {
          console.error(
            `TMDB lookup failed for "${rec.title || rec.name}":`,
            tmdbErr
          );
          return rec;
        }
      })
    );

    console.log(`${LOG_PREFIX} Success for user: ${session.user.id}, type: ${type}`);

    return NextResponse.json(
      { recommendations: enrichedRecommendations },
      {
        headers: {
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  } catch (err) {
    console.error(`${LOG_PREFIX} Error:`, err);
    return NextResponse.json(
      {
        error:
          "Ruh-roh! Something went wrong while processing recommendations.",
      },
      { status: 500 }
    );
  }
}

// Parses plain text or JSON-formatted model output into recommendation objects
function parseRecommendations(text, type) {
  try {
    if (text.includes("[") && text.includes("]")) {
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }

    const lines = text
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\.\s+.+/));

    return lines.map((line, index) => {
      const titleMatch = line.match(/^\d+\.\s+([^(]+)/);
      const yearMatch = line.match(/\((\d{4})\)/);
      const reasonMatch = line.match(/(?:-|:)\s+(.+)$/);

      return {
        id: `rec_${index}`,
        title:
          type === "movie"
            ? titleMatch?.[1]?.trim() ?? `Movie ${index + 1}`
            : null,
        name:
          type === "tv" ? titleMatch?.[1]?.trim() ?? `Show ${index + 1}` : null,
        year: yearMatch ? parseInt(yearMatch[1]) : null,
        reason: reasonMatch?.[1]?.trim() ?? null,
        recommendation: true,
      };
    });
  } catch (err) {
    console.error("Failed to parse LLM recommendations:", err);
    return [];
  }
}
