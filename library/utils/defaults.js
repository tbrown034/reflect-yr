// library/utils/defaults.js

// Media API defaults
export const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
export const POSTER_SMALL_URL = "https://image.tmdb.org/t/p/w92";
export const MOVIE_PLACEHOLDER = "/placeholder-movie.jpg";
export const TV_PLACEHOLDER = "/placeholder-tv.jpg";

// API request defaults
export const DEFAULT_SORT = "popularity.desc";
export const DEFAULT_LANGUAGE = "en-US";
export const DEFAULT_ITEMS_PER_PAGE = 20;

// Cache duration (in seconds)
export const CACHE_DURATION = 86400; // 24 hours

export const MAX_LIST_SIZE = 10;

// Use current year dynamically - string format for consistency with URL params
export const DEFAULT_YEAR = String(new Date().getFullYear());
