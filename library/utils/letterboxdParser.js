// library/utils/letterboxdParser.js
// Parses Letterboxd CSV exports and matches to TMDB

/**
 * Letterboxd Export Format:
 * - diary.csv: Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date
 * - ratings.csv: Date,Name,Year,Letterboxd URI,Rating
 * - watched.csv: Date,Name,Year,Letterboxd URI
 * - watchlist.csv: Date,Name,Year,Letterboxd URI
 */

const LOG_PREFIX = "[LetterboxdParser]";

/**
 * Parse a CSV string into an array of objects
 * Handles quoted fields with commas inside them
 */
export function parseCSV(csvString) {
  console.log(`${LOG_PREFIX} Starting CSV parse...`);

  if (!csvString || typeof csvString !== 'string') {
    console.error(`${LOG_PREFIX} Invalid CSV input`);
    return [];
  }

  const lines = csvString.trim().split('\n');
  if (lines.length < 2) {
    console.warn(`${LOG_PREFIX} CSV has no data rows`);
    return [];
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  console.log(`${LOG_PREFIX} Found headers:`, headers);

  // Parse data rows
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    results.push(row);
  }

  console.log(`${LOG_PREFIX} Parsed ${results.length} rows`);
  return results;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Check for escaped quote ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Don't forget the last field
  result.push(current.trim());

  return result;
}

/**
 * Detect which type of Letterboxd export this is
 */
export function detectLetterboxdFileType(headers) {
  const headerStr = headers.join(',').toLowerCase();

  if (headerStr.includes('watched date') || headerStr.includes('rewatch')) {
    return 'diary';
  } else if (headerStr.includes('rating') && !headerStr.includes('watched')) {
    return 'ratings';
  } else if (headerStr.includes('watchlist') ||
             (headers.length === 4 && !headerStr.includes('rating'))) {
    // Watchlist has same structure as watched but different context
    return 'watched'; // We'll treat watchlist same as watched for now
  }

  return 'watched';
}

/**
 * Parse Letterboxd diary.csv
 * Contains: Date, Name, Year, Letterboxd URI, Rating, Rewatch, Tags, Watched Date
 */
export function parseDiaryCSV(csvString) {
  console.log(`${LOG_PREFIX} Parsing diary.csv...`);
  const rows = parseCSV(csvString);

  return rows.map(row => ({
    title: row['Name'] || row['name'] || '',
    year: parseInt(row['Year'] || row['year']) || null,
    letterboxdUri: row['Letterboxd URI'] || row['letterboxd uri'] || '',
    rating: parseLetterboxdRating(row['Rating'] || row['rating']),
    watchedDate: row['Watched Date'] || row['watched date'] || null,
    isRewatch: (row['Rewatch'] || row['rewatch'] || '').toLowerCase() === 'yes',
    tags: (row['Tags'] || row['tags'] || '').split(',').map(t => t.trim()).filter(Boolean),
    source: 'letterboxd-diary',
  })).filter(item => item.title);
}

/**
 * Parse Letterboxd ratings.csv
 * Contains: Date, Name, Year, Letterboxd URI, Rating
 */
export function parseRatingsCSV(csvString) {
  console.log(`${LOG_PREFIX} Parsing ratings.csv...`);
  const rows = parseCSV(csvString);

  return rows.map(row => ({
    title: row['Name'] || row['name'] || '',
    year: parseInt(row['Year'] || row['year']) || null,
    letterboxdUri: row['Letterboxd URI'] || row['letterboxd uri'] || '',
    rating: parseLetterboxdRating(row['Rating'] || row['rating']),
    source: 'letterboxd-ratings',
  })).filter(item => item.title);
}

/**
 * Parse Letterboxd watched.csv
 * Contains: Date, Name, Year, Letterboxd URI
 */
export function parseWatchedCSV(csvString) {
  console.log(`${LOG_PREFIX} Parsing watched.csv...`);
  const rows = parseCSV(csvString);

  return rows.map(row => ({
    title: row['Name'] || row['name'] || '',
    year: parseInt(row['Year'] || row['year']) || null,
    letterboxdUri: row['Letterboxd URI'] || row['letterboxd uri'] || '',
    source: 'letterboxd-watched',
  })).filter(item => item.title);
}

/**
 * Parse Letterboxd watchlist.csv
 * Contains: Date, Name, Year, Letterboxd URI
 */
export function parseWatchlistCSV(csvString) {
  console.log(`${LOG_PREFIX} Parsing watchlist.csv...`);
  const rows = parseCSV(csvString);

  return rows.map(row => ({
    title: row['Name'] || row['name'] || '',
    year: parseInt(row['Year'] || row['year']) || null,
    letterboxdUri: row['Letterboxd URI'] || row['letterboxd uri'] || '',
    source: 'letterboxd-watchlist',
    isWatchlist: true,
  })).filter(item => item.title);
}

/**
 * Convert Letterboxd rating (0.5-5 stars) to our 1-5 scale
 * Letterboxd uses 0.5 increments
 */
export function parseLetterboxdRating(ratingStr) {
  if (!ratingStr || ratingStr === '') return null;

  const rating = parseFloat(ratingStr);
  if (isNaN(rating)) return null;

  // Letterboxd uses 0.5-5.0 scale, we use 1-5
  // Keep the same scale for now
  return Math.min(5, Math.max(0, rating));
}

/**
 * Auto-detect and parse any Letterboxd CSV file
 */
export function parseLetterboxdCSV(csvString, filename = '') {
  console.log(`${LOG_PREFIX} Auto-detecting file type for: ${filename}`);

  const lowerFilename = filename.toLowerCase();

  if (lowerFilename.includes('diary')) {
    return { type: 'diary', data: parseDiaryCSV(csvString) };
  } else if (lowerFilename.includes('ratings')) {
    return { type: 'ratings', data: parseRatingsCSV(csvString) };
  } else if (lowerFilename.includes('watchlist')) {
    return { type: 'watchlist', data: parseWatchlistCSV(csvString) };
  } else if (lowerFilename.includes('watched')) {
    return { type: 'watched', data: parseWatchedCSV(csvString) };
  }

  // Try to detect from content
  const firstLine = csvString.split('\n')[0].toLowerCase();
  if (firstLine.includes('watched date') || firstLine.includes('rewatch')) {
    return { type: 'diary', data: parseDiaryCSV(csvString) };
  } else if (firstLine.includes('rating')) {
    return { type: 'ratings', data: parseRatingsCSV(csvString) };
  }

  // Default to watched format
  return { type: 'watched', data: parseWatchedCSV(csvString) };
}

/**
 * Merge multiple Letterboxd imports into a single watched pool
 * Deduplicates by title+year, preferring entries with more data
 */
export function mergeLetterboxdImports(imports) {
  console.log(`${LOG_PREFIX} Merging ${imports.length} imports...`);

  const movieMap = new Map();

  for (const importData of imports) {
    for (const movie of importData.data) {
      const key = `${movie.title.toLowerCase()}-${movie.year || 'unknown'}`;

      const existing = movieMap.get(key);
      if (!existing) {
        movieMap.set(key, { ...movie });
      } else {
        // Merge: prefer data that exists
        movieMap.set(key, {
          ...existing,
          rating: movie.rating ?? existing.rating,
          watchedDate: movie.watchedDate ?? existing.watchedDate,
          tags: [...new Set([...(existing.tags || []), ...(movie.tags || [])])],
          isRewatch: movie.isRewatch || existing.isRewatch,
          letterboxdUri: movie.letterboxdUri || existing.letterboxdUri,
        });
      }
    }
  }

  const merged = Array.from(movieMap.values());
  console.log(`${LOG_PREFIX} Merged to ${merged.length} unique movies`);

  return merged;
}

/**
 * Filter movies by year
 */
export function filterByYear(movies, year) {
  if (!year) return movies;
  return movies.filter(m => m.year === year);
}

/**
 * Filter movies by decade
 */
export function filterByDecade(movies, decade) {
  if (!decade) return movies;
  const startYear = decade;
  const endYear = decade + 9;
  return movies.filter(m => m.year >= startYear && m.year <= endYear);
}

/**
 * Sort movies by various criteria
 */
export function sortMovies(movies, sortBy = 'watchedDate') {
  const sorted = [...movies];

  switch (sortBy) {
    case 'watchedDate':
      return sorted.sort((a, b) => {
        if (!a.watchedDate) return 1;
        if (!b.watchedDate) return -1;
        return new Date(b.watchedDate) - new Date(a.watchedDate);
      });
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'year':
      return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

/**
 * Get statistics about the watched pool
 */
export function getWatchedPoolStats(movies) {
  const stats = {
    total: movies.length,
    withRatings: movies.filter(m => m.rating != null).length,
    withDates: movies.filter(m => m.watchedDate != null).length,
    rewatches: movies.filter(m => m.isRewatch).length,
    byYear: {},
    byDecade: {},
    averageRating: 0,
  };

  let ratingSum = 0;
  let ratingCount = 0;

  for (const movie of movies) {
    if (movie.year) {
      stats.byYear[movie.year] = (stats.byYear[movie.year] || 0) + 1;
      const decade = Math.floor(movie.year / 10) * 10;
      stats.byDecade[decade] = (stats.byDecade[decade] || 0) + 1;
    }

    if (movie.rating != null) {
      ratingSum += movie.rating;
      ratingCount++;
    }
  }

  stats.averageRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : 0;

  console.log(`${LOG_PREFIX} Pool stats:`, stats);
  return stats;
}

export default {
  parseCSV,
  parseLetterboxdCSV,
  parseDiaryCSV,
  parseRatingsCSV,
  parseWatchedCSV,
  parseWatchlistCSV,
  mergeLetterboxdImports,
  filterByYear,
  filterByDecade,
  sortMovies,
  getWatchedPoolStats,
};
