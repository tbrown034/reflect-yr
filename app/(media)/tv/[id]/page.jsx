// app/(media)/tv/[id]/page.jsx
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  StarIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { getTvShowById } from "@/library/api/tmdb";
import ActionButtons from "@/components/ui/buttons/actions/DetailPageActions";

export async function generateMetadata({ params }) {
  // In Next.js 15, params is a Promise that needs to be awaited
  const resolvedParams = await params;
  const show = await getTvShowById(resolvedParams.id);

  if (!show) return { title: "TV Show Not Found" };

  return {
    title: `${show.name} (${
      show.first_air_date?.substring(0, 4) || "Unknown"
    }) | ReflectYr`,
    description: show.overview || "No description available",
  };
}

export default async function TvShowDetailPage({ params }) {
  // In Next.js 15, params is a Promise that needs to be awaited
  const resolvedParams = await params;
  const show = await getTvShowById(resolvedParams.id);

  if (!show) {
    notFound();
  }

  // Format release date
  const firstAirDate = show.first_air_date
    ? new Date(show.first_air_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown release date";

  // Format episode runtime
  const formattedRuntime = show.episode_run_time?.length
    ? `${show.episode_run_time[0]} mins/episode`
    : "Unknown runtime";

  // Get creator
  const creators =
    show.created_by?.map((person) => person.name).join(", ") ||
    "Unknown creator";

  // Get top cast (first 5)
  const topCast = show.credits?.cast?.slice(0, 5) || [];

  // Get genres as comma-separated string
  const genres =
    show.genres?.map((genre) => genre.name).join(", ") || "Unknown genre";

  // Season info
  const seasonCount = show.number_of_seasons || 0;
  const episodeCount = show.number_of_episodes || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Poster Section */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative w-full aspect-2/3 md:rounded-l-xl overflow-hidden">
              {show.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={`${show.name} poster`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
                  <span className="text-center p-4">No poster available</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {show.name}
            </h1>

            {/* Year & Rating */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-500 mr-1" />
                <span>{show.first_air_date?.substring(0, 4) || "Unknown"}</span>
              </div>

              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                <span>
                  {show.vote_average ? show.vote_average.toFixed(1) : "N/A"}
                </span>
              </div>

              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-500 mr-1" />
                <span>{formattedRuntime}</span>
              </div>

              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-500 mr-1" />
                <span>{creators}</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {genres}
              </span>
            </div>

            {/* Season & Episode Info */}
            <div className="mb-4 flex gap-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-800 dark:text-blue-100">
                {seasonCount} {seasonCount === 1 ? "Season" : "Seasons"}
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-lg text-green-800 dark:text-green-100">
                {episodeCount} {episodeCount === 1 ? "Episode" : "Episodes"}
              </span>
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Overview
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {show.overview || "No overview available."}
              </p>
            </div>

            {/* Cast Section */}
            {topCast.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Top Cast
                </h2>
                <div className="flex flex-wrap gap-2">
                  {topCast.map((actor) => (
                    <span
                      key={actor.id}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {actor.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <ActionButtons itemType="tv show" item={show} />
          </div>
        </div>
      </div>
    </div>
  );
}
