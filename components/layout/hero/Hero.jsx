// components/layout/hero/Hero.jsx
// Main hero section with visible grid layout

import { Suspense } from "react";
import HeroText from "./HeroText";
import HeroCTA from "./HeroCTA";
import CategoryCards from "./CategoryCards";
import ExampleList from "./ExampleList";
import ScrollingMixed from "./scrollingMedia/ScrollingMixed";
import { DEFAULT_YEAR } from "@/library/utils/defaults";

export default async function Hero({ searchParams }) {
  const year = searchParams?.year || DEFAULT_YEAR;

  return (
    <div className="flex flex-col">
      {/* Hero section - brand and CTA */}
      <section className="flex flex-col gap-4 sm:gap-5 justify-center items-center px-3 sm:px-4 py-8 sm:py-10 md:py-14">
        <HeroText />
        <HeroCTA />
      </section>

      {/* Category cards grid - visible grid design */}
      <section className="py-6 sm:py-8 border-t border-slate-200 dark:border-slate-700">
        <CategoryCards />
      </section>

      {/* Trending Now - grid of cards */}
      <section className="py-6 sm:py-8 border-t border-slate-200 dark:border-slate-700">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4">
          <div className="border-b border-slate-300 dark:border-slate-600 pb-3 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Trending Now
            </h2>
          </div>
          <Suspense fallback={<div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />}>
            <ScrollingMixed year={year} />
          </Suspense>
        </div>
      </section>

      {/* Interactive example list */}
      <section className="py-6 sm:py-8 border-t border-slate-200 dark:border-slate-700">
        <ExampleList />
      </section>

      {/* Bottom spacing */}
      <div className="h-12" />
    </div>
  );
}
