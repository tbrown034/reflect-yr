// library/api/providers/openLibrary.js
// Open Library provider - books data with no auth required

const LOG_PREFIX = "[OpenLibraryProvider]";
const BASE_URL = "https://openlibrary.org";
const COVERS_URL = "https://covers.openlibrary.org";

/**
 * Get cover image URL from cover ID
 */
export function getCoverUrl(coverId, size = "M") {
  if (!coverId) return null;
  // Sizes: S (small), M (medium), L (large)
  return `${COVERS_URL}/b/id/${coverId}-${size}.jpg`;
}

/**
 * Get cover URL from ISBN
 */
export function getCoverUrlByIsbn(isbn, size = "M") {
  if (!isbn) return null;
  return `${COVERS_URL}/b/isbn/${isbn}-${size}.jpg`;
}

/**
 * Normalize Open Library book to unified item shape
 * Note: Only use cover_i for images - ISBN-based covers are unreliable
 */
function normalizeBook(raw) {
  // Only use cover_i - it's the only reliable indicator of an actual cover image
  // ISBN-based URLs often return 1x1 transparent placeholders
  const hasCover = raw.cover_i && raw.cover_i > 0;

  return {
    id: `ol_${raw.key?.replace("/works/", "") || raw.cover_i || Date.now()}`,
    externalId: raw.key,
    category: "book",
    provider: "openLibrary",
    name: raw.title,
    image: hasCover ? getCoverUrl(raw.cover_i) : null,
    year: raw.first_publish_year || null,
    subtitle: raw.author_name?.join(", ") || null,
    metadata: {
      authors: raw.author_name || [],
      authorKeys: raw.author_key || [],
      subjects: raw.subject?.slice(0, 10) || [],
      isbn: raw.isbn || [],
      editionCount: raw.edition_count,
      languages: raw.language || [],
      hasFulltext: raw.has_fulltext,
      coverId: raw.cover_i,
    },
    rank: null,
    userRating: null,
    comment: "",
  };
}

/**
 * Search for books
 */
export async function search(query, options = {}) {
  const { limit = 10, author } = options;
  console.log(`${LOG_PREFIX} Searching books: "${query}"`);

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    fields: "key,title,author_name,author_key,first_publish_year,cover_i,isbn,subject,edition_count,language,has_fulltext",
  });

  if (author) {
    params.append("author", author);
  }

  try {
    const response = await fetch(`${BASE_URL}/search.json?${params}`, {
      headers: {
        "User-Agent": "sort-app/1.0 (trevorbrown.web@gmail.com)",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Open Library search failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`${LOG_PREFIX} Found ${data.numFound} results`);

    return data.docs.slice(0, limit).map(normalizeBook);
  } catch (error) {
    console.error(`${LOG_PREFIX} Search error:`, error);
    return [];
  }
}

/**
 * Discover trending/popular books
 * Open Library doesn't have a trending endpoint, so we search for common terms
 * We fetch extra results and filter to only those with covers
 */
export async function discover(options = {}) {
  const { year, limit = 20 } = options;
  console.log(`${LOG_PREFIX} Discovering books, year: ${year || "all"}`);

  // Search multiple queries to find books with covers
  // Open Library cover availability is inconsistent, so we cast a wide net
  // Start with year-specific queries, then fall back to evergreen popular books
  const yearQueries = year
    ? [`fiction ${year}`, `bestseller ${year}`, `novel ${year}`, `new release ${year}`]
    : [];

  // Evergreen queries that reliably return books with covers
  // Use specific popular authors/series that definitely have cover art
  const fallbackQueries = [
    "bestseller fiction",
    "popular novel 2024",
    "stephen king",
    "colleen hoover",
    "romantasy",
    "thriller bestseller",
    "fantasy series",
    "literary fiction award",
    "book club favorite",
    "science fiction hugo",
  ];

  const queries = [...yearQueries, ...fallbackQueries];
  const allResults = [];
  const seenIds = new Set();

  // Search each query and collect results with covers
  for (const query of queries) {
    if (allResults.length >= limit) break;

    const results = await search(query, { limit: 40 });

    for (const book of results) {
      // Only include books with covers and avoid duplicates
      if (book.image && !seenIds.has(book.id)) {
        seenIds.add(book.id);
        allResults.push(book);
        if (allResults.length >= limit) break;
      }
    }
  }

  console.log(`${LOG_PREFIX} Found ${allResults.length} books with covers`);
  return allResults.slice(0, limit);
}

/**
 * Get book by ID (Open Library key)
 */
export async function getById(id, options = {}) {
  // Handle prefixed IDs
  const olKey = String(id).replace(/^ol_/, "");
  const workPath = olKey.startsWith("/works/") ? olKey : `/works/${olKey}`;

  console.log(`${LOG_PREFIX} Getting book: ${workPath}`);

  try {
    const response = await fetch(`${BASE_URL}${workPath}.json`, {
      headers: {
        "User-Agent": "sort-app/1.0 (trevorbrown.web@gmail.com)",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch book: ${response.statusText}`);
    }

    const raw = await response.json();

    // Work endpoint has different structure, normalize it
    return {
      id: `ol_${olKey}`,
      externalId: workPath,
      category: "book",
      provider: "openLibrary",
      name: raw.title,
      image: raw.covers?.[0] ? getCoverUrl(raw.covers[0]) : null,
      year: raw.first_publish_date ? parseInt(raw.first_publish_date) : null,
      subtitle: null, // Would need separate author lookup
      metadata: {
        description: typeof raw.description === "string"
          ? raw.description
          : raw.description?.value || null,
        subjects: raw.subjects?.slice(0, 10) || [],
        covers: raw.covers || [],
      },
      rank: null,
      userRating: null,
      comment: "",
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} GetById error:`, error);
    return null;
  }
}

/**
 * Provider metadata
 */
export const providerInfo = {
  id: "openLibrary",
  name: "Open Library",
  categories: ["book"],
  requiresAuth: false,
  rateLimit: "100 requests per 5 minutes for covers",
};
