// app/lists/[type]/recommendations/[listId]/RecommendationsActions.jsx
"use client";

import { useState } from "react";
import { use } from "react"; // Add this import
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  BookmarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { ListContext } from "@/library/contexts/ListContext";

export default function RecommendationsActions({
  listId,
  type,
  pageTypeLabel,
  recommendations,
  originalList,
}) {
  const [isSaving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();
  const { saveRecommendationList } = use(ListContext);

  // Determine the link to the original list
  const listLink = `/lists/${type}/publish/${listId}`;

  // Handle regenerating recommendations
  const handleRegenerateClick = () => {
    // Just reload the page for a simple implementation
    window.location.reload();
  };

  // Handle saving the recommendation list
  const handleSaveList = () => {
    if (recommendations.length === 0) {
      alert("Cannot save an empty recommendation list.");
      return;
    }

    setSaving(true);

    try {
      // Create a title based on the original list
      const title = `Recommendations based on ${
        originalList?.title || "My List"
      }`;

      // Media type for storage (movie/tv, not movies/tv)
      const mediaType = type === "movies" ? "movie" : "tv";

      // Save the recommendation list
      const savedListId = saveRecommendationList(
        listId, // Source list ID
        mediaType, // Type (movie/tv)
        recommendations, // Items
        title // Title
      );

      if (savedListId) {
        setSaveSuccess(true);
        setTimeout(() => {
          // Navigate to the saved recommendations page (FIXED URL PATH)
          router.push(`/lists/${type}/saved-recommendations/${savedListId}`);
        }, 1500);
      } else {
        alert("Failed to save recommendation list. Please try again.");
        setSaving(false);
      }
    } catch (error) {
      console.error("Error saving recommendation list:", error);
      alert("An error occurred while saving. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-4 sm:px-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Primary actions */}
        <div className="flex flex-wrap gap-2">
          {/* Back to List */}
          <Link
            href={listLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to List</span>
          </Link>

          {/* Save Recommendations */}
          <button
            onClick={handleSaveList}
            disabled={isSaving || saveSuccess || recommendations.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              saveSuccess
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : recommendations.length === 0
                ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <BookmarkIcon className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary actions */}
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {/* Regenerate */}
          <button
            onClick={handleRegenerateClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Regenerate</span>
          </button>

          {/* Browse All */}
          <Link
            href={`/${type}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>Browse {pageTypeLabel}s</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
