import { Suspense } from "react";
import HeroText from "./HeroText";
import HeroCTA from "./HeroCTA";
import ScrollingCategory from "./scrollingMedia/ScrollingCategory";
import { CategoryRowSkeleton } from "@/components/ui/skeletons";
import { DEFAULT_YEAR } from "@/library/utils/defaults";

// Categories to display on the home page with their scroll directions
const HOME_CATEGORIES = [
  { category: "movie", direction: "left", name: "Movies" },
  { category: "tv", direction: "right", name: "TV Shows" },
  { category: "book", direction: "left", name: "Books" },
  { category: "anime", direction: "right", name: "Anime" },
  { category: "podcast", direction: "left", name: "Podcasts" },
];

export default async function Hero({ searchParams }) {
  const year = searchParams?.year || DEFAULT_YEAR;

  return (
    <div className="flex flex-col">
      {/* Hero section - centered text and CTA */}
      <section className="flex flex-col gap-6 justify-center items-center px-4 py-8 md:py-12">
        <HeroText />
        <HeroCTA />
      </section>

      {/* Content rows section */}
      <section className="flex flex-col gap-10 py-6">
        {HOME_CATEGORIES.map(({ category, direction, name }) => (
          <Suspense
            key={category}
            fallback={<CategoryRowSkeleton title={`Popular ${name}`} />}
          >
            <ScrollingCategory
              category={category}
              year={year}
              direction={direction}
              limit={15}
            />
          </Suspense>
        ))}
      </section>

      {/* Bottom padding for mobile nav clearance */}
      <div className="h-16" />
    </div>
  );
}
