"use client";

import TvCard from "@/components/ui/cards/TvCard";

export default function TvShowsList({ shows }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {shows.map((show) => (
        <TvCard key={show.id} show={show} />
      ))}
    </ul>
  );
}
