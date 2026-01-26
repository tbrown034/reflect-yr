"use client";

import PodcastCard from "@/components/ui/cards/PodcastCard";

export default function PodcastsList({ podcasts }) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
      {podcasts.map((podcast) => (
        <PodcastCard key={podcast.id} podcast={podcast} />
      ))}
    </ul>
  );
}
