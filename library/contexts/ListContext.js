// library/contexts/ListContext.js
"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { MAX_LIST_SIZE } from "@/library/utils/defaults";
import { generateListId, generateShareCode } from "@/library/utils/listUtils";
import { CATEGORIES, getAllCategories } from "@/library/api/providers/types";

const LOG_PREFIX = "[ListContext]";

// Define constants for localStorage keys
const STORAGE_KEYS = {
  MOVIE_LIST: "userMovieList",
  TV_LIST: "userTvList",
  TEMP_LISTS: "tempLists", // New unified temp lists
  PUBLISHED_LISTS: "publishedLists",
  RECOMMENDATION_LISTS: "recommendationLists",
  WATCHED_POOL: "watchedPool",
};

// List limits for anonymous users
const MAX_TOTAL_LISTS_ANONYMOUS = 10; // Increased from 5
const TEMP_LIST_CLEANUP_AFTER_PUBLISH = true;

// Available list themes
export const LIST_THEMES = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Clean numbered list with posters",
  },
  "poster-grid": {
    id: "poster-grid",
    name: "Poster Grid",
    description: "Visual grid of movie posters",
  },
  "family-feud": {
    id: "family-feud",
    name: "Family Feud",
    description: "Reveal one by one, game show style",
  },
  awards: {
    id: "awards",
    name: "Awards Show",
    description: "Elegant awards ceremony style",
  },
  minimalist: {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple text-based list",
  },
};

// Create the context with default values
export const ListContext = createContext({
  // State
  movieList: [],
  tvList: [],
  tempLists: {}, // New: { category: [items] }
  publishedLists: {},
  recommendationLists: {},
  watchedPool: { movies: [], tv: [] },
  isInitialized: false,

  // Category utilities
  CATEGORIES,
  getAllCategories: () => [],

  // Temporary list operations (legacy movie/tv)
  addToList: () => false,
  removeFromList: () => {},
  moveItemUp: () => {},
  moveItemDown: () => {},
  moveItem: () => {},
  clearList: () => {},
  isInList: () => false,

  // New multi-category temp list operations
  addToTempList: () => false,
  removeFromTempList: () => {},
  getTempList: () => [],
  clearTempList: () => {},
  isInTempList: () => false,
  moveTempItem: () => {},

  // Published list operations
  publishList: () => null,
  createEnhancedList: () => null,
  getPublishedList: () => null,
  updatePublishedListItems: () => {},
  updatePublishedListMetadata: () => {},
  updateItemComment: () => {},
  updateItemRating: () => {},
  removePublishedListItem: () => {},
  deletePublishedList: () => {},
  deleteAllPublishedLists: () => {},
  getListByShareCode: () => null,

  // Recommendation list operations
  recommendationLists: {},
  saveRecommendationList: () => null,
  getRecommendationList: () => null,
  deleteRecommendationList: () => {},
  deleteAllRecommendationLists: () => {},
  updateRecommendationList: () => {},
  removeRecommendationItem: () => {},

  // Watched pool operations
  addToWatchedPool: () => {},
  removeFromWatchedPool: () => {},
  importToWatchedPool: () => {},
  clearWatchedPool: () => {},
  isInWatchedPool: () => false,
  getWatchedPoolByYear: () => [],

  // List limit functions
  getTotalListCount: () => 0,
  getRemainingListCount: () => 0,
  hasReachedTotalListLimit: () => false,
  ANONYMOUS_LIST_LIMIT: MAX_TOTAL_LISTS_ANONYMOUS,

  // Theme helpers
  LIST_THEMES,
});

export function ListProvider({ children }) {
  // State for lists
  const [movieList, setMovieList] = useState([]);
  const [tvList, setTvList] = useState([]);
  const [tempLists, setTempLists] = useState({}); // New: { category: [items] }
  const [publishedLists, setPublishedLists] = useState({});
  const [recommendationLists, setRecommendationLists] = useState({});
  const [watchedPool, setWatchedPool] = useState({ movies: [], tv: [] });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize lists from localStorage
  useEffect(() => {
    console.log(`${LOG_PREFIX} Initializing from localStorage...`);
    try {
      const storedMovieList = localStorage.getItem(STORAGE_KEYS.MOVIE_LIST);
      const storedTvList = localStorage.getItem(STORAGE_KEYS.TV_LIST);
      const storedTempLists = localStorage.getItem(STORAGE_KEYS.TEMP_LISTS);
      const storedPublishedLists = localStorage.getItem(STORAGE_KEYS.PUBLISHED_LISTS);
      const storedRecommendationLists = localStorage.getItem(STORAGE_KEYS.RECOMMENDATION_LISTS);
      const storedWatchedPool = localStorage.getItem(STORAGE_KEYS.WATCHED_POOL);

      if (storedMovieList) setMovieList(JSON.parse(storedMovieList));
      if (storedTvList) setTvList(JSON.parse(storedTvList));
      if (storedTempLists) setTempLists(JSON.parse(storedTempLists));
      if (storedPublishedLists) setPublishedLists(JSON.parse(storedPublishedLists));
      if (storedRecommendationLists) setRecommendationLists(JSON.parse(storedRecommendationLists));
      if (storedWatchedPool) setWatchedPool(JSON.parse(storedWatchedPool));

      console.log(`${LOG_PREFIX} Loaded from localStorage:`, {
        movieList: storedMovieList ? JSON.parse(storedMovieList).length : 0,
        tvList: storedTvList ? JSON.parse(storedTvList).length : 0,
        tempLists: storedTempLists ? Object.keys(JSON.parse(storedTempLists)).length : 0,
        publishedLists: storedPublishedLists ? Object.keys(JSON.parse(storedPublishedLists)).length : 0,
        watchedPool: storedWatchedPool ? JSON.parse(storedWatchedPool).movies?.length : 0,
      });

      setIsInitialized(true);
    } catch (error) {
      console.error(`${LOG_PREFIX} Error loading from localStorage:`, error);
      setIsInitialized(true);
    }
  }, []);

  // Save movie list to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MOVIE_LIST, JSON.stringify(movieList));
      console.log(`${LOG_PREFIX} Saved movieList (${movieList.length} items)`);
    } catch (error) {
      console.error(`${LOG_PREFIX} Error saving movie list:`, error);
    }
  }, [movieList, isInitialized]);

  // Save TV list to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TV_LIST, JSON.stringify(tvList));
      console.log(`${LOG_PREFIX} Saved tvList (${tvList.length} items)`);
    } catch (error) {
      console.error(`${LOG_PREFIX} Error saving TV list:`, error);
    }
  }, [tvList, isInitialized]);

  // Save temp lists to localStorage (new multi-category)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TEMP_LISTS, JSON.stringify(tempLists));
      const totalItems = Object.values(tempLists).reduce((sum, list) => sum + list.length, 0);
      console.log(`${LOG_PREFIX} Saved tempLists (${Object.keys(tempLists).length} categories, ${totalItems} items)`);
    } catch (error) {
      console.error(`${LOG_PREFIX} Error saving temp lists:`, error);
    }
  }, [tempLists, isInitialized]);

  // Save published lists to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PUBLISHED_LISTS, JSON.stringify(publishedLists));
      console.log(`${LOG_PREFIX} Saved publishedLists (${Object.keys(publishedLists).length} lists)`);
    } catch (error) {
      console.error(`${LOG_PREFIX} Error saving published lists:`, error);
    }
  }, [publishedLists, isInitialized]);

  // Save recommendation lists to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATION_LISTS, JSON.stringify(recommendationLists));
    } catch (error) {
      console.error(`${LOG_PREFIX} Error saving recommendation lists:`, error);
    }
  }, [recommendationLists, isInitialized]);

  // Save watched pool to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHED_POOL, JSON.stringify(watchedPool));
      console.log(`${LOG_PREFIX} Saved watchedPool (${watchedPool.movies?.length || 0} movies, ${watchedPool.tv?.length || 0} TV)`);
    } catch (error) {
      console.error(`${LOG_PREFIX} Error saving watched pool:`, error);
    }
  }, [watchedPool, isInitialized]);

  // ========================================
  // List Limit Functions
  // ========================================

  const getTotalListCount = useCallback(() => {
    const publishedCount = Object.keys(publishedLists).length;
    const recommendationCount = Object.keys(recommendationLists).length;
    return publishedCount + recommendationCount;
  }, [publishedLists, recommendationLists]);

  const getRemainingListCount = useCallback(() => {
    const currentCount = getTotalListCount();
    return Math.max(0, MAX_TOTAL_LISTS_ANONYMOUS - currentCount);
  }, [getTotalListCount]);

  const hasReachedTotalListLimit = useCallback(() => {
    // TODO: Check auth status - no limit for logged in users
    const isLoggedIn = false;
    if (isLoggedIn) return false;
    return getTotalListCount() >= MAX_TOTAL_LISTS_ANONYMOUS;
  }, [getTotalListCount]);

  // ========================================
  // Temporary List Operations
  // ========================================

  const isInList = useCallback((itemType, itemId) => {
    const list = itemType === "movie" ? movieList : tvList;
    return list.some((item) => item.id === itemId);
  }, [movieList, tvList]);

  const addToList = useCallback((itemType, item) => {
    if (!item || !item.id) {
      console.warn(`${LOG_PREFIX} addToList: Invalid item`);
      return false;
    }

    const list = itemType === "movie" ? movieList : tvList;
    const setList = itemType === "movie" ? setMovieList : setTvList;

    if (list.some((listItem) => listItem.id === item.id)) {
      console.log(`${LOG_PREFIX} Item already in list: ${item.id}`);
      return false;
    }

    if (list.length >= MAX_LIST_SIZE) {
      console.warn(`${LOG_PREFIX} List full (max ${MAX_LIST_SIZE})`);
      return false;
    }

    const essentialData = {
      id: item.id,
      title: itemType === "movie" ? item.title : undefined,
      name: itemType === "tv" ? item.name : undefined,
      poster_path: item.poster_path,
      release_date: itemType === "movie" ? item.release_date : undefined,
      first_air_date: itemType === "tv" ? item.first_air_date : undefined,
      vote_average: item.vote_average,
      overview: item.overview?.substring(0, 300),
      addedAt: new Date().toISOString(),
      // New fields for enhanced lists
      userRating: null,
      comment: "",
    };

    setList([...list, essentialData]);
    console.log(`${LOG_PREFIX} Added to ${itemType} list: ${item.title || item.name}`);
    return true;
  }, [movieList, tvList]);

  const removeFromList = useCallback((itemType, itemId) => {
    const setList = itemType === "movie" ? setMovieList : setTvList;
    setList((prev) => prev.filter((item) => item.id !== itemId));
    console.log(`${LOG_PREFIX} Removed from ${itemType} list: ${itemId}`);
  }, []);

  const moveItemUp = useCallback((itemType, itemId) => {
    const list = itemType === "movie" ? movieList : tvList;
    const setList = itemType === "movie" ? setMovieList : setTvList;
    const index = list.findIndex((item) => item.id === itemId);

    if (index <= 0) return;

    const newList = [...list];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setList(newList);
  }, [movieList, tvList]);

  const moveItemDown = useCallback((itemType, itemId) => {
    const list = itemType === "movie" ? movieList : tvList;
    const setList = itemType === "movie" ? setMovieList : setTvList;
    const index = list.findIndex((item) => item.id === itemId);

    if (index === -1 || index >= list.length - 1) return;

    const newList = [...list];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    setList(newList);
  }, [movieList, tvList]);

  // Move item to specific position
  const moveItem = useCallback((itemType, itemId, newIndex) => {
    const list = itemType === "movie" ? movieList : tvList;
    const setList = itemType === "movie" ? setMovieList : setTvList;
    const currentIndex = list.findIndex((item) => item.id === itemId);

    if (currentIndex === -1 || newIndex < 0 || newIndex >= list.length) return;

    const newList = [...list];
    const [removed] = newList.splice(currentIndex, 1);
    newList.splice(newIndex, 0, removed);
    setList(newList);
  }, [movieList, tvList]);

  const clearList = useCallback((itemType) => {
    const setList = itemType === "movie" ? setMovieList : setTvList;
    setList([]);
    console.log(`${LOG_PREFIX} Cleared ${itemType} list`);
  }, []);

  // ========================================
  // Multi-Category Temp List Operations (New)
  // ========================================

  const getTempList = useCallback((category) => {
    return tempLists[category] || [];
  }, [tempLists]);

  const isInTempList = useCallback((category, itemId) => {
    const list = tempLists[category] || [];
    return list.some((item) => item.id === itemId);
  }, [tempLists]);

  const addToTempList = useCallback((category, item) => {
    if (!item || !item.id) {
      console.warn(`${LOG_PREFIX} addToTempList: Invalid item`);
      return false;
    }

    if (!CATEGORIES[category]) {
      console.warn(`${LOG_PREFIX} addToTempList: Invalid category ${category}`);
      return false;
    }

    const list = tempLists[category] || [];

    if (list.some((listItem) => listItem.id === item.id)) {
      console.log(`${LOG_PREFIX} Item already in ${category} list: ${item.id}`);
      return false;
    }

    if (list.length >= MAX_LIST_SIZE) {
      console.warn(`${LOG_PREFIX} List full (max ${MAX_LIST_SIZE})`);
      return false;
    }

    // Store normalized item shape
    const essentialData = {
      id: item.id,
      externalId: item.externalId || item.id,
      category: item.category || category,
      provider: item.provider,
      name: item.name || item.title,
      image: item.image || item.poster_path,
      year: item.year,
      subtitle: item.subtitle,
      metadata: item.metadata || {},
      addedAt: new Date().toISOString(),
      userRating: item.userRating || null,
      comment: item.comment || "",
    };

    setTempLists((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), essentialData],
    }));

    console.log(`${LOG_PREFIX} Added to ${category} list: ${item.name || item.title}`);
    return true;
  }, [tempLists]);

  const removeFromTempList = useCallback((category, itemId) => {
    setTempLists((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((item) => item.id !== itemId),
    }));
    console.log(`${LOG_PREFIX} Removed from ${category} list: ${itemId}`);
  }, []);

  const moveTempItem = useCallback((category, itemId, newIndex) => {
    const list = tempLists[category] || [];
    const currentIndex = list.findIndex((item) => item.id === itemId);

    if (currentIndex === -1 || newIndex < 0 || newIndex >= list.length) return;

    const newList = [...list];
    const [removed] = newList.splice(currentIndex, 1);
    newList.splice(newIndex, 0, removed);

    setTempLists((prev) => ({
      ...prev,
      [category]: newList,
    }));
  }, [tempLists]);

  const clearTempList = useCallback((category) => {
    if (category) {
      setTempLists((prev) => ({
        ...prev,
        [category]: [],
      }));
      console.log(`${LOG_PREFIX} Cleared ${category} temp list`);
    } else {
      setTempLists({});
      console.log(`${LOG_PREFIX} Cleared all temp lists`);
    }
  }, []);

  // ========================================
  // Published List Operations
  // ========================================

  // Legacy publish function (for backwards compatibility)
  const publishList = useCallback((itemType) => {
    const list = itemType === "movie" ? movieList : tvList;

    if (list.length === 0) {
      console.warn(`${LOG_PREFIX} Cannot publish empty list`);
      return null;
    }

    if (hasReachedTotalListLimit()) {
      console.warn(`${LOG_PREFIX} List limit reached`);
      return null;
    }

    const listId = generateListId();
    const shareCode = generateShareCode();

    const newPublishedList = {
      id: listId,
      type: itemType,
      items: list.map((item, index) => ({
        ...item,
        rank: index + 1,
        userRating: item.userRating || null,
        comment: item.comment || "",
      })),
      title: `My Top ${itemType === "movie" ? "Movies" : "TV Shows"}`,
      description: "",
      theme: "classic",
      accentColor: "#3B82F6",
      publishedAt: new Date().toISOString(),
      shareCode,
      isPublic: true,
      year: new Date().getFullYear(),
    };

    setPublishedLists((prev) => ({ ...prev, [listId]: newPublishedList }));

    if (TEMP_LIST_CLEANUP_AFTER_PUBLISH) {
      clearList(itemType);
    }

    console.log(`${LOG_PREFIX} Published list: ${listId} (shareCode: ${shareCode})`);
    return listId;
  }, [movieList, tvList, hasReachedTotalListLimit, clearList]);

  // Enhanced list creation with all new features (supports all categories)
  const createEnhancedList = useCallback((options) => {
    const {
      type = "movie", // Can be any category: movie, tv, book, athlete, anime, podcast, custom, etc.
      category, // Alias for type (new multi-category support)
      items = [],
      title = "",
      description = "",
      theme = "classic",
      accentColor = "#3B82F6",
      year = new Date().getFullYear(),
      isPublic = true,
    } = options;

    // Support both 'type' (legacy) and 'category' (new)
    const listCategory = category || type;

    if (items.length === 0) {
      console.warn(`${LOG_PREFIX} Cannot create empty list`);
      return null;
    }

    if (hasReachedTotalListLimit()) {
      console.warn(`${LOG_PREFIX} List limit reached`);
      return null;
    }

    const listId = generateListId();
    const shareCode = generateShareCode();

    // Get category display name for default title
    const categoryConfig = CATEGORIES[listCategory];
    const categoryName = categoryConfig?.name || listCategory;

    // Normalize items to unified shape
    const enhancedItems = items.map((item, index) => ({
      // Core fields (unified)
      id: item.id,
      externalId: item.externalId || item.id,
      category: item.category || listCategory,
      provider: item.provider,
      name: item.name || item.title,
      image: item.image || item.poster_path,
      year: item.year,
      subtitle: item.subtitle,
      metadata: item.metadata || {},
      // Legacy TMDB fields (backwards compatibility)
      title: item.title,
      poster_path: item.poster_path || item.image,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      overview: item.overview?.substring(0, 300),
      // List-specific fields
      rank: index + 1,
      userRating: item.userRating || null,
      comment: item.comment || "",
    }));

    const newList = {
      id: listId,
      type: listCategory,
      category: listCategory, // New field for clarity
      items: enhancedItems,
      title: title || `My Top ${categoryName} ${year}`,
      description,
      theme,
      accentColor,
      year,
      publishedAt: new Date().toISOString(),
      shareCode,
      isPublic,
    };

    setPublishedLists((prev) => ({ ...prev, [listId]: newList }));
    console.log(`${LOG_PREFIX} Created enhanced list: ${listId}`, { category: listCategory, theme, year, itemCount: items.length });

    return listId;
  }, [hasReachedTotalListLimit]);

  const getPublishedList = useCallback((listId) => {
    if (!isInitialized) return null;
    return publishedLists[listId] || null;
  }, [isInitialized, publishedLists]);

  const getListByShareCode = useCallback((shareCode) => {
    if (!isInitialized || !shareCode) return null;

    const list = Object.values(publishedLists).find(
      (l) => l.shareCode === shareCode && l.isPublic
    );

    console.log(`${LOG_PREFIX} Looking up shareCode: ${shareCode}`, list ? "found" : "not found");
    return list || null;
  }, [isInitialized, publishedLists]);

  const updatePublishedListItems = useCallback((listId, newItems) => {
    setPublishedLists((prev) => {
      if (!prev[listId]) return prev;

      // Ensure items have ranks
      const rankedItems = newItems.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          items: rankedItems,
          publishedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updatePublishedListMetadata = useCallback((listId, metadataUpdate) => {
    console.log(`${LOG_PREFIX} Updating list metadata: ${listId}`, metadataUpdate);
    setPublishedLists((prev) => {
      if (!prev[listId]) return prev;

      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          ...metadataUpdate,
          publishedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  // Update comment for a specific item in a list
  const updateItemComment = useCallback((listId, itemId, comment) => {
    console.log(`${LOG_PREFIX} Updating item comment: list=${listId}, item=${itemId}`);
    setPublishedLists((prev) => {
      if (!prev[listId]) return prev;

      const updatedItems = prev[listId].items.map((item) =>
        item.id === itemId ? { ...item, comment } : item
      );

      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          items: updatedItems,
          publishedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  // Update user rating for a specific item in a list
  const updateItemRating = useCallback((listId, itemId, rating) => {
    console.log(`${LOG_PREFIX} Updating item rating: list=${listId}, item=${itemId}, rating=${rating}`);
    setPublishedLists((prev) => {
      if (!prev[listId]) return prev;

      const updatedItems = prev[listId].items.map((item) =>
        item.id === itemId ? { ...item, userRating: rating } : item
      );

      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          items: updatedItems,
          publishedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const removePublishedListItem = useCallback((listId, itemId) => {
    setPublishedLists((prev) => {
      if (!prev[listId]) return prev;

      const newItems = prev[listId].items
        .filter((item) => item.id !== itemId)
        .map((item, index) => ({ ...item, rank: index + 1 }));

      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          items: newItems,
          publishedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const deletePublishedList = useCallback((listId) => {
    console.log(`${LOG_PREFIX} Deleting list: ${listId}`);
    setPublishedLists((prev) => {
      const newLists = { ...prev };
      delete newLists[listId];
      return newLists;
    });
  }, []);

  const deleteAllPublishedLists = useCallback(() => {
    console.log(`${LOG_PREFIX} Deleting all published lists`);
    setPublishedLists({});
  }, []);

  // ========================================
  // Recommendation List Operations
  // ========================================

  const saveRecommendationList = useCallback((sourceListId, type, items, title) => {
    if (!items || items.length === 0) {
      console.warn(`${LOG_PREFIX} Cannot save empty recommendation list`);
      return null;
    }

    if (hasReachedTotalListLimit()) {
      return null;
    }

    const listId = generateListId();
    const newRecommendationList = {
      id: listId,
      type,
      sourceListId,
      items: [...items],
      title: title || `Recommendations based on My ${type === "movie" ? "Movies" : "TV Shows"}`,
      savedAt: new Date().toISOString(),
    };

    setRecommendationLists((prev) => ({ ...prev, [listId]: newRecommendationList }));
    console.log(`${LOG_PREFIX} Saved recommendation list: ${listId}`);
    return listId;
  }, [hasReachedTotalListLimit]);

  const getRecommendationList = useCallback((listId) => {
    if (!isInitialized) return null;
    return recommendationLists[listId] || null;
  }, [isInitialized, recommendationLists]);

  const updateRecommendationList = useCallback((listId, newItems) => {
    setRecommendationLists((prev) => {
      if (!prev[listId]) return prev;
      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          items: newItems,
          savedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const removeRecommendationItem = useCallback((listId, itemId) => {
    setRecommendationLists((prev) => {
      if (!prev[listId]) return prev;

      const newItems = prev[listId].items.filter((item) => item.id !== itemId);

      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          items: newItems,
          savedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const deleteRecommendationList = useCallback((listId) => {
    setRecommendationLists((prev) => {
      const newLists = { ...prev };
      delete newLists[listId];
      return newLists;
    });
  }, []);

  const deleteAllRecommendationLists = useCallback(() => {
    setRecommendationLists({});
  }, []);

  // ========================================
  // Watched Pool Operations
  // ========================================

  const isInWatchedPool = useCallback((type, id) => {
    const pool = type === "movie" ? watchedPool.movies : watchedPool.tv;
    return pool?.some((item) => item.id === id) || false;
  }, [watchedPool]);

  const addToWatchedPool = useCallback((type, item) => {
    if (!item || !item.id) return;

    const key = type === "movie" ? "movies" : "tv";

    setWatchedPool((prev) => {
      const pool = prev[key] || [];

      // Don't add duplicates
      if (pool.some((p) => p.id === item.id)) {
        console.log(`${LOG_PREFIX} Item already in watched pool: ${item.id}`);
        return prev;
      }

      const newItem = {
        id: item.id,
        title: item.title,
        name: item.name,
        year: item.year || (item.release_date ? parseInt(item.release_date.split("-")[0]) : null),
        poster_path: item.poster_path,
        rating: item.rating || item.userRating || null,
        watchedDate: item.watchedDate || null,
        source: item.source || "manual",
        letterboxdUri: item.letterboxdUri || null,
        addedAt: new Date().toISOString(),
      };

      console.log(`${LOG_PREFIX} Added to watched pool: ${item.title || item.name}`);

      return {
        ...prev,
        [key]: [...pool, newItem],
      };
    });
  }, []);

  const removeFromWatchedPool = useCallback((type, id) => {
    const key = type === "movie" ? "movies" : "tv";

    setWatchedPool((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((item) => item.id !== id),
    }));
  }, []);

  // Import from Letterboxd (bulk add)
  const importToWatchedPool = useCallback((items, type = "movie") => {
    console.log(`${LOG_PREFIX} Importing ${items.length} items to watched pool`);

    const key = type === "movie" ? "movies" : "tv";

    setWatchedPool((prev) => {
      const existingPool = prev[key] || [];
      const existingIds = new Set(existingPool.map((p) => p.id));

      const newItems = items
        .filter((item) => {
          // For Letterboxd imports, use title+year as key since we don't have TMDB ID yet
          const key = `${item.title?.toLowerCase()}-${item.year}`;
          return item.title && !existingPool.some(
            (p) => `${(p.title || p.name)?.toLowerCase()}-${p.year}` === key
          );
        })
        .map((item) => ({
          id: item.id || `lb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title,
          year: item.year,
          poster_path: item.poster_path || null,
          rating: item.rating,
          watchedDate: item.watchedDate,
          source: item.source || "letterboxd",
          letterboxdUri: item.letterboxdUri,
          tags: item.tags || [],
          isRewatch: item.isRewatch || false,
          addedAt: new Date().toISOString(),
          // Flag that this needs TMDB matching
          needsTmdbMatch: !item.id || item.id.startsWith("lb-"),
        }));

      console.log(`${LOG_PREFIX} Adding ${newItems.length} new items (${items.length - newItems.length} duplicates skipped)`);

      return {
        ...prev,
        [key]: [...existingPool, ...newItems],
      };
    });
  }, []);

  const clearWatchedPool = useCallback((type) => {
    if (type) {
      const key = type === "movie" ? "movies" : "tv";
      setWatchedPool((prev) => ({ ...prev, [key]: [] }));
    } else {
      setWatchedPool({ movies: [], tv: [] });
    }
    console.log(`${LOG_PREFIX} Cleared watched pool${type ? ` (${type})` : ""}`);
  }, []);

  const getWatchedPoolByYear = useCallback((type, year) => {
    const pool = type === "movie" ? watchedPool.movies : watchedPool.tv;
    if (!year) return pool || [];
    return (pool || []).filter((item) => item.year === year);
  }, [watchedPool]);

  // ========================================
  // Context Provider
  // ========================================

  return (
    <ListContext.Provider
      value={{
        // State
        movieList,
        tvList,
        tempLists, // New: multi-category temp lists
        publishedLists,
        recommendationLists,
        watchedPool,
        isInitialized,

        // Category utilities
        CATEGORIES,
        getAllCategories,

        // Temporary list operations (legacy movie/tv)
        addToList,
        removeFromList,
        moveItemUp,
        moveItemDown,
        moveItem,
        clearList,
        isInList,

        // Multi-category temp list operations (new)
        addToTempList,
        removeFromTempList,
        getTempList,
        clearTempList,
        isInTempList,
        moveTempItem,

        // Published list operations
        publishList,
        createEnhancedList,
        getPublishedList,
        getListByShareCode,
        updatePublishedListItems,
        updatePublishedListMetadata,
        updateItemComment,
        updateItemRating,
        removePublishedListItem,
        deletePublishedList,
        deleteAllPublishedLists,

        // Recommendation list operations
        saveRecommendationList,
        getRecommendationList,
        updateRecommendationList,
        removeRecommendationItem,
        deleteRecommendationList,
        deleteAllRecommendationLists,

        // Watched pool operations
        addToWatchedPool,
        removeFromWatchedPool,
        importToWatchedPool,
        clearWatchedPool,
        isInWatchedPool,
        getWatchedPoolByYear,

        // List limit functions
        getTotalListCount,
        getRemainingListCount,
        hasReachedTotalListLimit,
        ANONYMOUS_LIST_LIMIT: MAX_TOTAL_LISTS_ANONYMOUS,

        // Theme helpers
        LIST_THEMES,
      }}
    >
      {children}
    </ListContext.Provider>
  );
}
