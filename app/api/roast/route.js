// app/api/roast/route.js
// AI-powered list analysis/roast feature using Claude

import { NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request) {
  try {
    const { list, mode = "roast" } = await request.json();

    if (!list || !list.items || list.items.length === 0) {
      return NextResponse.json(
        { error: "No list items provided" },
        { status: 400 }
      );
    }

    const listSummary = list.items
      .map(
        (item, i) =>
          `${i + 1}. ${item.title || item.name}${item.userRating ? ` (${item.userRating}/5 stars)` : ""}${item.comment ? ` - "${item.comment}"` : ""}`
      )
      .join("\n");

    const prompts = {
      roast: `You're a witty film critic with a sharp tongue. Analyze this person's "${list.title || "Favorite Movies"}" list and deliver a playful roast. Be funny but not mean-spirited. Point out interesting patterns, contradictions, or guilty pleasures. Keep it under 150 words.

Their list:
${listSummary}

Deliver your roast:`,

      analyze: `You're a thoughtful film analyst. Analyze this person's "${list.title || "Favorite Movies"}" list and provide insightful observations about their taste. What genres do they gravitate toward? Any interesting patterns or themes? Keep it under 150 words.

Their list:
${listSummary}

Your analysis:`,

      predict: `Based on this person's "${list.title || "Favorite Movies"}" list, predict what they might enjoy next. Suggest 3 movies/shows they'd probably love, with brief explanations. Keep it under 150 words.

Their list:
${listSummary}

Your predictions:`,

      debate: `You're playing devil's advocate. Look at this "${list.title || "Favorite Movies"}" list and argue why the #1 pick shouldn't be #1. Be playful and provocative. Keep it under 100 words.

Their list:
${listSummary}

Your counterargument:`,
    };

    const prompt = prompts[mode] || prompts.roast;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      console.error("[Roast API] Anthropic error:", await anthropicRes.text());
      return NextResponse.json(
        { error: "Failed to generate analysis" },
        { status: anthropicRes.status }
      );
    }

    const data = await anthropicRes.json();
    const response = data?.content?.[0]?.text ?? "";

    return NextResponse.json({
      roast: response,
      mode,
      listTitle: list.title,
      itemCount: list.items.length,
    });
  } catch (error) {
    console.error("[Roast API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate roast" },
      { status: 500 }
    );
  }
}
