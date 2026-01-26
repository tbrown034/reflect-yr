// components/layout/hero/scrollingMedia/ScrollingMixed.jsx
// Server component - fetches data with daily caching, passes to animated grid

import { unstable_cache } from "next/cache";
import { discover } from "@/library/api/providers";
import TrendingGrid from "../TrendingGrid";

// Cached fetch function - revalidates once per day (86400 seconds)
const getCachedTrendingItems = unstable_cache(
  async (year, itemsPerCategory) => {
    const categories = ["movie", "tv", "book", "podcast"];

    const results = await Promise.allSettled(
      categories.map(async (cat) => {
        const items = await discover(cat, {
          year: cat === "movie" || cat === "tv" ? year : undefined,
          limit: itemsPerCategory,
        });
        return items.map((item) => ({ ...item, _category: cat }));
      })
    );

    // Combine all successful results
    const allItems = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value);

    return allItems;
  },
  ["trending-items"],
  { revalidate: 86400 } // 24 hours
);

export default async function ScrollingMixed({ year, itemsPerCategory = 4 }) {
  const allItems = await getCachedTrendingItems(year, itemsPerCategory);

  if (allItems.length === 0) {
    return null;
  }

  return <TrendingGrid items={allItems} />;
}
