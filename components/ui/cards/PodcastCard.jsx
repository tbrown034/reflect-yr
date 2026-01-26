"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MicrophoneIcon } from "@heroicons/react/24/solid";
import AddToListButton from "@/components/ui/buttons/actions/AddToListButton";

export default function PodcastCard({ podcast }) {
  const [imageError, setImageError] = useState(false);

  // Extract the podcast ID from the full ID (e.g., "itunes_podcast_123456" -> "123456")
  const podcastId = podcast.id?.replace("itunes_podcast_", "") || podcast.externalId;

  // Get artwork URL - podcast.image is already the full URL from the provider
  const artworkUrl = podcast.image;
  const hasImage = artworkUrl && !imageError;

  return (
    <li className="h-full">
      <Link href={`/podcasts/${podcastId}`} className="block h-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md sm:shadow-xl overflow-hidden transition-all duration-300 hover:shadow-lg sm:hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 h-full flex flex-col relative">
          {/* Artwork Image - Square aspect ratio for podcasts */}
          <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
            {hasImage ? (
              <Image
                src={artworkUrl}
                alt={`${podcast.name} artwork`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-orange-600 dark:text-orange-400 p-4">
                <MicrophoneIcon className="h-12 w-12 mb-2 opacity-50" />
                <span className="text-xs text-center opacity-75 line-clamp-2">{podcast.name}</span>
              </div>
            )}

            {/* Explicit badge */}
            {podcast.metadata?.explicit && (
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                <span>E</span>
              </div>
            )}

            {/* Add to list button */}
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
              <AddToListButton itemType="podcast" item={podcast} />
            </div>
          </div>

          {/* Orange accent bar */}
          <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600"></div>

          {/* Content */}
          <div className="p-3 sm:p-4 grow flex flex-col bg-white dark:bg-gray-800">
            <h3 className="font-bold text-xs sm:text-sm md:text-base text-gray-900 dark:text-white line-clamp-2 mb-0.5 sm:mb-1">
              {podcast.name}
            </h3>
            {podcast.subtitle && (
              <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-1">
                {podcast.subtitle}
              </p>
            )}
            {podcast.metadata?.primaryGenre && (
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 mt-1">
                {podcast.metadata.primaryGenre}
              </p>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
