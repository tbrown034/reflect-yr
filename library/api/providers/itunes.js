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
 */
export async function discover(options = {}) {
  const { limit = 20, genre, country = "US" } = options;
  console.log(`${LOG_PREFIX} Discovering podcasts`);

  // iTunes doesn't have a great "discover" endpoint
  // Use top charts or search for popular terms
  const params = new URLSearchParams({
    term: "podcast",
    media: "podcast",
    entity: "podcast",
    limit: limit.toString(),
    country,
  });

  if (genre) {
    params.append("genreId", genre);
  }

  try {
    const response = await fetch(`${BASE_URL}/search?${params}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`iTunes discover failed: ${response.statusText}`);
    }

    const data = await response.json();
    const results = (data.results || []).slice(0, limit).map(normalizePodcast);
    console.log(`${LOG_PREFIX} Found ${results.length} podcasts`);
    return results;
  } catch (error) {
    console.error(`${LOG_PREFIX} Discover error:`, error);
    return [];
  }
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
