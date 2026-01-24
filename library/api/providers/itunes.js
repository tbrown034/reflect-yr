// library/api/providers/itunes.js
// iTunes/Apple Podcasts provider

const LOG_PREFIX = "[iTunesProvider]";
const BASE_URL = "https://itunes.apple.com";

/**
 * Normalize iTunes podcast to unified item shape
 */
function normalizePodcast(raw) {
  return {
    id: `itunes_podcast_${raw.collectionId || raw.trackId}`,
    externalId: raw.collectionId || raw.trackId,
    category: "podcast",
    provider: "itunes",
    name: raw.collectionName || raw.trackName,
    image: raw.artworkUrl600 || raw.artworkUrl100 || raw.artworkUrl60 || null,
    year: raw.releaseDate ? parseInt(raw.releaseDate.split("-")[0]) : null,
    subtitle: raw.artistName || null,
    metadata: {
      artistName: raw.artistName,
      artistId: raw.artistId,
      feedUrl: raw.feedUrl,
      trackCount: raw.trackCount,
      genres: raw.genres || [],
      primaryGenre: raw.primaryGenreName,
      country: raw.country,
      contentAdvisory: raw.contentAdvisoryRating,
      explicit: raw.collectionExplicitness === "explicit",
      artworkSmall: raw.artworkUrl60,
      artworkMedium: raw.artworkUrl100,
      artworkLarge: raw.artworkUrl600,
      collectionViewUrl: raw.collectionViewUrl,
    },
    rank: null,
    userRating: null,
    comment: "",
  };
}

/**
 * Search for podcasts
 */
export async function search(query, options = {}) {
  const { limit = 10, country = "US" } = options;
  console.log(`${LOG_PREFIX} Searching podcasts: "${query}"`);

  const params = new URLSearchParams({
    term: query,
    media: "podcast",
    entity: "podcast",
    limit: limit.toString(),
    country,
  });

  try {
    const response = await fetch(`${BASE_URL}/search?${params}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`iTunes search failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`${LOG_PREFIX} Found ${data.resultCount} podcasts`);

    return (data.results || []).slice(0, limit).map(normalizePodcast);
  } catch (error) {
    console.error(`${LOG_PREFIX} Search error:`, error);
    return [];
  }
}

/**
 * Discover top podcasts
 * For year filtering, we check if podcast had episodes/activity in that year
 */
export async function discover(options = {}) {
  const { limit = 20, year, genre, country = "US" } = options;
  console.log(`${LOG_PREFIX} Discovering podcasts${year ? `, year: ${year}` : ""}`);

  // iTunes doesn't have a great "discover" endpoint
  // Use search for popular podcast terms
  const searchTerms = ["top podcast", "popular podcast", "best podcast"];
  const allResults = [];
  const seenIds = new Set();

  for (const term of searchTerms) {
    if (allResults.length >= limit) break;

    const params = new URLSearchParams({
      term,
      media: "podcast",
      entity: "podcast",
      limit: "50", // Fetch more to filter by year
      country,
    });

    if (genre) {
      params.append("genreId", genre);
    }

    try {
      const response = await fetch(`${BASE_URL}/search?${params}`, {
        next: { revalidate: 86400 },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const podcasts = (data.results || []).map(normalizePodcast);

      for (const podcast of podcasts) {
        if (allResults.length >= limit) break;
        if (seenIds.has(podcast.id)) continue;

        // If year filter is set, only include podcasts from that year or still active
        // Podcasts are considered "active in year" if they started before/during that year
        if (year && podcast.year && podcast.year > year) continue;

        seenIds.add(podcast.id);
        allResults.push(podcast);
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} Discover error for term "${term}":`, error);
    }
  }

  console.log(`${LOG_PREFIX} Found ${allResults.length} podcasts`);
  return allResults.slice(0, limit);
}

/**
 * Get podcast by ID
 */
export async function getById(id, options = {}) {
  const itunesId = String(id).replace(/^itunes_podcast_/, "");
  console.log(`${LOG_PREFIX} Getting podcast: ${itunesId}`);

  const params = new URLSearchParams({
    id: itunesId,
    entity: "podcast",
  });

  try {
    const response = await fetch(`${BASE_URL}/lookup?${params}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch podcast: ${response.statusText}`);
    }

    const data = await response.json();
    const podcast = data.results?.[0];

    return podcast ? normalizePodcast(podcast) : null;
  } catch (error) {
    console.error(`${LOG_PREFIX} GetById error:`, error);
    return null;
  }
}

/**
 * Provider metadata
 */
export const providerInfo = {
  id: "itunes",
  name: "Apple Podcasts",
  categories: ["podcast"],
  requiresAuth: false,
  rateLimit: null, // No documented limit
};
