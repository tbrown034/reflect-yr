"use client";

import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef } from "react";

// Helper function to format date/time
function formatDate(dateString) {
  if (!dateString) return "Unknown Date";

  try {
    // Format to include date and time, using locale settings
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid Date";
  }
}

export default function PublishedListHeader({
  listData, // The full list object { id, type, items, title, publishedAt }
  listIsMovieType, // Boolean: true if listData.type === 'movie'
  isEditingTitle, // Boolean: true if title input should be shown
  editableTitle, // String: Current value of the title input
  onTitleChange, // Function: (event) => void - Handles input changes
  onEditTitleClick, // Function: () => void - Toggles edit mode on
  onConfirmEditTitle, // Function: () => void - Saves the title change
  onCancelEditTitle, // Function: () => void - Cancels edit mode
}) {
  // Determine the default title if none is set in listData
  const defaultTitle = `My Top ${listIsMovieType ? "Movies" : "TV Shows"}`;

  // Use the title from listData or fall back to the default
  const displayTitle = listData?.title || defaultTitle;

  // Reference to input element for keyboard events
  const inputRef = useRef(null);

  // Handle keydown events for input field - capture Enter key
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onConfirmEditTitle();
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancelEditTitle();
        }
      };

      const inputElement = inputRef.current;
      inputElement.addEventListener("keydown", handleKeyDown);

      // Focus the input when editing starts
      inputElement.focus();

      return () => {
        inputElement.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isEditingTitle, onConfirmEditTitle, onCancelEditTitle]);

  return (
    // Header section container
    <div className="p-6 border-b dark:border-gray-700">
      {/* Flex container for title and edit buttons */}
      <div className="flex items-start sm:items-center justify-between gap-4 mb-2">
        {/* Conditional rendering: Input field or Displayed Title */}
        {isEditingTitle ? (
          <input
            ref={inputRef}
            type="text"
            value={editableTitle}
            onChange={onTitleChange}
            className="grow text-3xl font-bold p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            autoFocus
            aria-label="List title input"
          />
        ) : (
          // Display the list title, allowing word breaks
          <h1 className="text-3xl font-bold grow min-w-0 break-words mr-2">
            {displayTitle}
          </h1>
        )}

        {/* Container for edit/confirm/cancel buttons */}
        <div className="shrink-0 flex items-center gap-1 sm:gap-2 mt-1 sm:mt-0">
          {/* Conditional rendering: Confirm/Cancel or Edit button */}
          {isEditingTitle ? (
            <>
              <button
                onClick={onConfirmEditTitle}
                className="p-2 text-green-600 hover:text-green-800 dark:hover:text-green-300 transition-colors cursor-pointer"
                title="Confirm title"
              >
                <CheckIcon className="h-6 w-6" />
              </button>
              <button
                onClick={onCancelEditTitle}
                className="p-2 text-red-600 hover:text-red-800 dark:hover:text-red-300 transition-colors cursor-pointer"
                title="Cancel edit"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </>
          ) : (
            <button
              onClick={onEditTitleClick}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
              title="Edit list title"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Display the last updated timestamp */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Last Updated: {formatDate(listData?.publishedAt)}
      </p>
    </div>
  );
}
