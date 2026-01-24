// library/api/providers/jikan.js
// Jikan provider - MyAnimeList data (anime/manga)

const LOG_PREFIX = "[JikanProvider]";
const BASE_URL = "https://api.jikan.moe/v4";

/**
 * Normalize Jikan anime to unified item shape
 */
function normalizeAnime(raw) {
  return {
    id: `jikan_anime_${raw.mal_id}`,
    externalId: raw.mal_id,
    category: "anime",
    provider: "jikan",
    name: raw.title_english || raw.title,
    image: raw.images?.jpg?.large_image_url || raw.images?.jpg?.image_url || null,
    year: raw.year || (raw.aired?.from ? parseInt(raw.aired.from.split("-")[0]) : null),
    subtitle: raw.studios?.map((s) => s.name).join(", ") || null,
    metadata: {
      titleJapanese: raw.title_japanese,
      titleEnglish: raw.title_english,
      type: raw.type, // TV, Movie, OVA, etc.
      episodes: raw.episodes,
      status: raw.status,
      airing: raw.airing,
      duration: raw.duration,
      rating: raw.rating, // Age rating
      score: raw.score,
      scoredBy: raw.scored_by,
      rank: raw.rank,
      popularity: raw.popularity,
      members: raw.members,
      favorites: raw.favorites,
      synopsis: raw.synopsis,
      season: raw.season,
      source: raw.source, // Manga, Light Novel, etc.
      genres: raw.genres?.map((g) => g.name) || [],
      themes: raw.themes?.map((t) => t.name) || [],
      demographics: raw.demographics?.map((d) => d.name) || [],
      studios: raw.studios?.map((s) => s.name) || [],
      producers: raw.producers?.map((p) => p.name) || [],
      trailer: raw.trailer?.url || null,
      images: raw.images,
    },
    rank: null,
    userRating: null,
    comment: "",
  };
}

/**
 * Search for anime
 * Note: Jikan has rate limits, so we add delay handling
 */
export async function search(query, options = {}) {
  const { limit = 10, year, type } = options;
  console.log(`${LOG_PREFIX} Searching anime: "${query}"`);

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    sfw: "true", // Safe for work filter
  });

  // Note: Don't filter by year in search - it's too restrictive
  // Users can search for any anime, year is just for list organization
  if (type) params.append("type", type); // tv, movie, ova, special, ona, music

  try {
    const response = await fetch(`${BASE_URL}/anime?${params}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour (Jikan rate limits)
    });

    if (response.status === 429) {
      console.warn(`${LOG_PREFIX} Rate limited, returning empty`);
      return [];
    }

    if (!response.ok) {
      throw new Error(`Jikan search failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(
      `${LOG_PREFIX} Found ${data.pagination?.items?.total || 0} results`
    );

    return (data.data || []).slice(0, limit).map(normalizeAnime);
  } catch (error) {
    console.error(`${LOG_PREFIX} Search error:`, error);
    return [];
  }
}

/**
 * Discover top/popular anime
 */
export async function discover(options = {}) {
  const { limit = 20, filter = "bypopularity" } = options;
  console.log(`${LOG_PREFIX} Discovering anime, filter: ${filter}`);

  // Available filters: airing, upcoming, bypopularity, favorite
  const params = new URLSearchParams({
    filter,
    limit: limit.toString(),
    sfw: "true",
  });

  try {
    const response = await fetch(`${BASE_URL}/top/anime?${params}`, {
      next: { revalidate: 3600 },
    });

    if (response.status === 429) {
      console.warn(`${LOG_PREFIX} Rate limited`);
      return [];
    }

    if (!response.ok) {
      throw new Error(`Jikan discover failed: ${response.statusText}`);
    }

    const data = await response.json();
    const results = (data.data || []).slice(0, limit).map(normalizeAnime);
    console.log(`${LOG_PREFIX} Found ${results.length} anime`);
    return results;
  } catch (error) {
    console.error(`${LOG_PREFIX} Discover error:`, error);
    return [];
  }
}

/**
 * Get anime by ID
 */
export async function getById(id, options = {}) {
  const malId = String(id).replace(/^jikan_anime_/, "");
  console.log(`${LOG_PREFIX} Getting anime: ${malId}`);

  try {
    const response = await fetch(`${BASE_URL}/anime/${malId}/full`, {
      next: { revalidate: 86400 },
    });

    if (response.status === 429) {
      console.warn(`${LOG_PREFIX} Rate limited`);
      return null;
    }

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch anime: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data ? normalizeAnime(data.data) : null;
  } catch (error) {
    console.error(`${LOG_PREFIX} GetById error:`, error);
    return null;
  }
}

/**
 * Provider metadata
 */
export const providerInfo = {
  id: "jikan",
  name: "Jikan (MyAnimeList)",
  categories: ["anime"],
  requiresAuth: false,
  rateLimit: "3 requests per second, 60 per minute",
};
