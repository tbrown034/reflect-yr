// library/api/providers/itunes.js
// iTunes/Apple provider for podcasts and albums

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
 * Normalize iTunes album to unified item shape
 */
function normalizeAlbum(raw) {
  return {
    id: `itunes_album_${raw.collectionId}`,
    externalId: raw.collectionId,
    category: "album",
    provider: "itunes",
    name: raw.collectionName,
    image: raw.artworkUrl100?.replace("100x100", "600x600") || raw.artworkUrl100 || null,
    year: raw.releaseDate ? parseInt(raw.releaseDate.split("-")[0]) : null,
    subtitle: raw.artistName || null,
    metadata: {
      artistName: raw.artistName,
      artistId: raw.artistId,
      trackCount: raw.trackCount,
      primaryGenre: raw.primaryGenreName,
      country: raw.country,
      explicit: raw.collectionExplicitness === "explicit",
      copyright: raw.copyright,
      artworkSmall: raw.artworkUrl60,
      artworkMedium: raw.artworkUrl100,
      artworkLarge: raw.artworkUrl100?.replace("100x100", "600x600"),
      collectionViewUrl: raw.collectionViewUrl,
      collectionPrice: raw.collectionPrice,
      currency: raw.currency,
    },
    rank: null,
    userRating: null,
    comment: "",
  };
}

/**
 * Get normalizer and entity for category
 */
function getCategoryConfig(category) {
  if (category === "album") {
    return {
      normalizer: normalizeAlbum,
      media: "music",
      entity: "album",
    };
  }
  // Default to podcast
  return {
    normalizer: normalizePodcast,
    media: "podcast",
    entity: "podcast",
  };
}

/**
 * Search for podcasts or albums
 */
export async function search(query, options = {}) {
  const { limit = 10, country = "US", category = "podcast" } = options;
  const config = getCategoryConfig(category);

  console.log(`${LOG_PREFIX} Searching ${category}: "${query}"`);

  const params = new URLSearchParams({
    term: query,
    media: config.media,
    entity: config.entity,
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
    console.log(`${LOG_PREFIX} Found ${data.resultCount} ${category}s`);

    return (data.results || []).slice(0, limit).map(config.normalizer);
  } catch (error) {
    console.error(`${LOG_PREFIX} Search error:`, error);
    return [];
  }
}

/**
 * Discover top podcasts or albums
 */
export async function discover(options = {}) {
  const { limit = 20, year, startYear, endYear, country = "US", category = "podcast" } = options;
  const config = getCategoryConfig(category);

  console.log(`${LOG_PREFIX} Discovering ${category}s${year ? `, year: ${year}` : ""}`);

  // Search terms for discovery
  const searchTerms = category === "album"
    ? ["top album", "best album", "popular album", "new album"]
    : ["top podcast", "popular podcast", "best podcast"];

  const allResults = [];
  const seenIds = new Set();

  for (const term of searchTerms) {
    if (allResults.length >= limit) break;

    const params = new URLSearchParams({
      term,
      media: config.media,
      entity: config.entity,
      limit: "50",
      country,
    });

    try {
      const response = await fetch(`${BASE_URL}/search?${params}`, {
        next: { revalidate: 86400 },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const items = (data.results || []).map(config.normalizer);

      for (const item of items) {
        if (allResults.length >= limit) break;
        if (seenIds.has(item.id)) continue;

        // Year filtering
        if (year && item.year && item.year !== year) continue;
        if (startYear && endYear && item.year) {
          if (item.year < startYear || item.year > endYear) continue;
        }

        seenIds.add(item.id);
        allResults.push(item);
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} Discover error for term "${term}":`, error);
    }
  }

  console.log(`${LOG_PREFIX} Found ${allResults.length} ${category}s`);
  return allResults.slice(0, limit);
}

/**
 * Get item by ID
 */
export async function getById(id, options = {}) {
  const { category = "podcast" } = options;
  const config = getCategoryConfig(category);

  // Strip prefix if present
  const itunesId = String(id).replace(/^itunes_(podcast|album)_/, "");
  console.log(`${LOG_PREFIX} Getting ${category}: ${itunesId}`);

  const params = new URLSearchParams({
    id: itunesId,
    entity: config.entity,
  });

  try {
    const response = await fetch(`${BASE_URL}/lookup?${params}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${category}: ${response.statusText}`);
    }

    const data = await response.json();
    const item = data.results?.[0];

    return item ? config.normalizer(item) : null;
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
  name: "Apple iTunes",
  categories: ["podcast", "album"],
  requiresAuth: false,
  rateLimit: null,
};
