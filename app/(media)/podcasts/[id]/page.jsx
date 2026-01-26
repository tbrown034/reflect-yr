import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MicrophoneIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  PlayCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { getById } from "@/library/api/providers";
import ActionButtons from "@/components/ui/buttons/actions/DetailPageActions";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const podcast = await getById(resolvedParams.id, "podcast");

  if (!podcast) return { title: "Podcast Not Found" };

  return {
    title: `${podcast.name} | Sortid`,
    description: `${podcast.subtitle || podcast.name} - ${podcast.metadata?.primaryGenre || "Podcast"}`,
  };
}

export default async function PodcastDetailPage({ params }) {
  const resolvedParams = await params;
  const podcast = await getById(resolvedParams.id, "podcast");

  if (!podcast) {
    notFound();
  }

  // Get host/artist
  const host = podcast.metadata?.artistName || podcast.subtitle || "Unknown host";

  // Get genres
  const genres = podcast.metadata?.genres || [];
  const primaryGenre = podcast.metadata?.primaryGenre;

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Artwork Section - Square */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative w-full aspect-square md:rounded-l-xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
              {podcast.image ? (
                <Image
                  src={podcast.image}
                  alt={`${podcast.name} artwork`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-orange-600 dark:text-orange-400 p-8">
                  <MicrophoneIcon className="h-24 w-24 mb-4 opacity-50" />
                  <span className="text-lg text-center opacity-75">{podcast.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-2/3 lg:w-3/4 p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {podcast.name}
              </h1>
              {podcast.metadata?.explicit && (
                <span className="shrink-0 mt-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded">
                  EXPLICIT
                </span>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1" />
                <span className="text-sm sm:text-base">{host}</span>
              </div>

              {podcast.year && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1" />
                  <span className="text-sm sm:text-base">Since {podcast.year}</span>
                </div>
              )}

              {podcast.metadata?.trackCount && (
                <div className="flex items-center">
                  <PlayCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1" />
                  <span className="text-sm sm:text-base">{podcast.metadata.trackCount} episodes</span>
                </div>
              )}

              {podcast.metadata?.contentAdvisory && (
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-1" />
                  <span className="text-sm sm:text-base">{podcast.metadata.contentAdvisory}</span>
                </div>
              )}
            </div>

            {/* Genre */}
            {primaryGenre && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {primaryGenre}
                </span>
              </div>
            )}

            {/* All Genres */}
            {genres.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                  <TagIcon className="h-5 w-5 text-orange-500" />
                  Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs sm:text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apple Podcasts Link */}
            {podcast.metadata?.collectionViewUrl && (
              <div className="mb-6">
                <a
                  href={podcast.metadata.collectionViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm sm:text-base"
                >
                  <PlayCircleIcon className="h-5 w-5" />
                  Listen on Apple Podcasts
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <ActionButtons itemType="podcast" item={podcast} />
          </div>
        </div>
      </div>
    </div>
  );
}
