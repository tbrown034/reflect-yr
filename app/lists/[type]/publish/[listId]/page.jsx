"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { use } from "react";
import { ListContext } from "@/library/contexts/ListContext";

// Import components
import PublishedListHeader from "./PublishedListHeader";
import PublishedListItems from "./PublishedListItems";
import PublishedListShare from "./PublishedListShare";
import PublishedListActions from "./PublishedListActions";

import { getShareableUrl, getPublicShareUrl, formatListText } from "@/library/utils/listUtils";

export default function PublishedListPage() {
  // Get route parameters
  const params = useParams();
  const type = params?.type;
  const listId = params?.listId;
  const router = useRouter();

  // Get context functions using use()
  const {
    getPublishedList,
    updatePublishedListItems,
    updatePublishedListMetadata,
    removePublishedListItem,
    clearList,
  } = use(ListContext);

  // Component state
  const [listData, setListData] = useState(null);
  const [currentItems, setCurrentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listNotFound, setListNotFound] = useState(false);
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState(false);
  const [copiedTextSuccess, setCopiedTextSuccess] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");

  // Derived values
  const isValidType = type === "movies" || type === "tv";
  const pageTypeLabel = type === "movies" ? "Movie" : "TV Show";
  const listIsMovieType = listData?.type === "movie";

  // Load list data on component mount and when params change
  useEffect(() => {
    if (!isValidType || !listId) {
      setListNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setListNotFound(false);

    const fetchedList = getPublishedList(listId);

    if (!fetchedList) {
      setListNotFound(true);
    } else {
      const fetchedListIsMovie = fetchedList.type === "movie";

      // Check if URL type matches list type
      if (
        (fetchedListIsMovie && type !== "movies") ||
        (!fetchedListIsMovie && type !== "tv")
      ) {
        setListNotFound(true);
      } else {
        setListData(fetchedList);
        setCurrentItems(fetchedList.items ? [...fetchedList.items] : []);
        setEditableTitle(fetchedList.title || "");
      }
    }

    setIsLoading(false);
  }, [listId, type, getPublishedList, isValidType]);

  // Function to refresh state from context
  function syncLocalStateFromContext() {
    if (!listId) return;

    const freshListData = getPublishedList(listId);

    if (freshListData) {
      setListData(freshListData);
      setCurrentItems(freshListData.items ? [...freshListData.items] : []);

      if (!isEditingTitle) {
        setEditableTitle(freshListData.title || "");
      }
    } else {
      setListNotFound(true);
    }
  }

  // Function to update items and/or metadata
  function updateAndSync(newItems, metadata = {}) {
    if (!listId) return;

    if (newItems) {
      updatePublishedListItems(listId, newItems);
    }

    if (Object.keys(metadata).length > 0) {
      updatePublishedListMetadata(listId, metadata);
    }

    // Give a moment for context to update
    setTimeout(syncLocalStateFromContext, 50);
  }

  // Item movement handlers
  function handleMoveItemUp(itemId) {
    const index = currentItems.findIndex((item) => item.id === itemId);

    if (index <= 0) return;

    const newItems = [...currentItems];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];

    setCurrentItems(newItems);
    updateAndSync(newItems);
  }

  function handleMoveItemDown(itemId) {
    const index = currentItems.findIndex((item) => item.id === itemId);

    if (index === -1 || index >= currentItems.length - 1) return;

    const newItems = [...currentItems];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];

    setCurrentItems(newItems);
    updateAndSync(newItems);
  }

  // Item removal handler
  function handleRemoveItem(itemId) {
    if (window.confirm("Are you sure you want to remove this item?")) {
      const newItems = currentItems.filter((item) => item.id !== itemId);
      setCurrentItems(newItems);
      removePublishedListItem(listId, itemId);
      setTimeout(syncLocalStateFromContext, 50);
    }
  }

  // Title editing handlers
  function handleEditTitleClick() {
    setEditableTitle(listData?.title || "");
    setIsEditingTitle(true);
  }

  function handleCancelEditTitle() {
    setIsEditingTitle(false);
    setEditableTitle(listData?.title || "");
  }

  function handleConfirmEditTitle() {
    const newTitle =
      editableTitle.trim() ||
      `My Top ${listIsMovieType ? "Movies" : "TV Shows"}`;

    // First update the context
    updatePublishedListMetadata(listId, { title: newTitle });

    // Then immediately update local state to ensure UI consistency
    setIsEditingTitle(false);

    // Directly update the local listData to avoid waiting for the sync
    setListData((prev) => ({
      ...prev,
      title: newTitle,
    }));
  }

  function handleTitleInputChange(event) {
    setEditableTitle(event.target.value);
  }

  // Sharing handlers
  function handleCopyLink() {
    if (!type || !listId || !isValidType || !listData) return;

    // Use the public share code URL if available, otherwise fallback to publish URL
    const shareUrl = listData.shareCode
      ? getPublicShareUrl(listData.shareCode)
      : getShareableUrl(type, listId);

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopiedLinkSuccess(true);
        setTimeout(() => setCopiedLinkSuccess(false), 3000);
      })
      .catch((err) => console.error("Failed to copy link:", err));
  }

  function handleCopyText() {
    if (!currentItems || currentItems.length === 0 || !listData) return;

    const textToCopy = formatListText(currentItems, listData.type);
    const listTitle =
      listData.title || `My Top ${listIsMovieType ? "Movies" : "TV Shows"}`;
    const fullText = `${listTitle}\n\n${textToCopy}`;

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        setCopiedTextSuccess(true);
        setTimeout(() => setCopiedTextSuccess(false), 3000);
      })
      .catch((err) => console.error("Failed to copy text:", err));
  }

  function handleSocialShare(platform) {
    if (!type || !listId || !isValidType || !listData) return;

    // Use the public share code URL if available
    const rawUrl = listData.shareCode
      ? getPublicShareUrl(listData.shareCode)
      : getShareableUrl(type, listId);
    const shareUrl = encodeURIComponent(rawUrl);
    const listTitle =
      listData.title || `My Top ${listIsMovieType ? "Movies" : "TV Shows"}`;
    const text = encodeURIComponent(`Check out my list: ${listTitle}`);
    let platformUrl = "";

    switch (platform) {
      case "twitter":
        platformUrl = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`;
        break;
      case "facebook":
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case "bluesky":
        platformUrl = `https://bsky.app/intent/compose?text=${text}%0A${shareUrl}`;
        break;
      case "instagram":
        handleCopyLink();
        alert("Instagram sharing isn't directly supported. Link copied!");
        return;
      default:
        return;
    }

    window.open(platformUrl, "_blank", "noopener,noreferrer");
  }

  // Other action handlers
  function handleCreateNew() {
    const typeToClear = listData?.type || (type === "movies" ? "movie" : "tv");

    if (
      window.confirm(
        `Are you sure? This will clear your *temporary* ${pageTypeLabel} list and take you to the browse page.`
      )
    ) {
      clearList(typeToClear);
      router.push(type === "movies" ? "/movies" : "/tv");
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <p className="text-lg animate-pulse text-gray-600 dark:text-gray-400">
          Loading list...
        </p>
      </div>
    );
  }

  // Render not found state
  if (listNotFound) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">List Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The requested list could not be found, accessed, or its type doesn't
          match the URL. Remember, lists are currently stored locally.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  // Render main content
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header with title and edit functionality */}
        <PublishedListHeader
          listData={listData}
          listIsMovieType={listIsMovieType}
          isEditingTitle={isEditingTitle}
          editableTitle={editableTitle}
          onTitleChange={handleTitleInputChange}
          onEditTitleClick={handleEditTitleClick}
          onConfirmEditTitle={handleConfirmEditTitle}
          onCancelEditTitle={handleCancelEditTitle}
        />

        {/* Main content - list items */}
        <div className="p-6">
          <PublishedListItems
            items={currentItems}
            listIsMovieType={listIsMovieType}
            onMoveUp={handleMoveItemUp}
            onMoveDown={handleMoveItemDown}
            onRemove={handleRemoveItem}
          />

          {/* Button to add more items */}
          <div className="mt-6">
            <Link
              href={`/${type}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm"
              title={`Add more ${pageTypeLabel}s to your temporary list`}
            >
              <PlusIcon className="h-5 w-5 shrink-0" />
              <span>Add More {pageTypeLabel}s</span>
            </Link>
          </div>
        </div>

        {/* Footer area with sharing and actions */}
        <div className="p-6 border-t dark:border-gray-700 space-y-4 bg-gray-50 dark:bg-gray-800">
          <PublishedListShare
            type={type}
            listId={listId}
            isValidType={isValidType}
            currentItems={currentItems}
            copiedLinkSuccess={copiedLinkSuccess}
            copiedTextSuccess={copiedTextSuccess}
            onCopyLink={handleCopyLink}
            onCopyText={handleCopyText}
            onSocialShare={handleSocialShare}
          />
          <PublishedListActions
            isValidType={isValidType}
            pageTypeLabel={pageTypeLabel}
            listId={listId}
            onCreateNew={handleCreateNew}
          />
        </div>
      </div>
    </div>
  );
}
