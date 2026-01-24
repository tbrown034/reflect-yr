"use client";

import { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ListContext } from "@/library/contexts/ListContext";
import { ListThemeRenderer } from "@/components/ui/lists";
import Link from "next/link";
import {
  ShareIcon,
  ClipboardIcon,
  CheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const LOG_PREFIX = "[SharePage]";

export default function SharePage() {
  const params = useParams();
  const shareCode = params?.code;

  const { getListByShareCode, isInitialized } = use(ListContext);

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  console.log(`${LOG_PREFIX} Rendering share page for code: ${shareCode}`);

  useEffect(() => {
    if (!isInitialized || !shareCode) return;

    console.log(`${LOG_PREFIX} Looking up list by share code: ${shareCode}`);
    const foundList = getListByShareCode(shareCode);

    if (foundList) {
      console.log(`${LOG_PREFIX} Found list: ${foundList.title}`);
      setList(foundList);
    } else {
      console.log(`${LOG_PREFIX} List not found for code: ${shareCode}`);
    }

    setLoading(false);
  }, [isInitialized, shareCode, getListByShareCode]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      console.log(`${LOG_PREFIX} Copied share link to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(`${LOG_PREFIX} Failed to copy:`, err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && list) {
      try {
        await navigator.share({
          title: list.title,
          text: `Check out my ${list.type === "movie" ? "movie" : "TV"} list: ${list.title}`,
          url: window.location.href,
        });
        console.log(`${LOG_PREFIX} Shared successfully`);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(`${LOG_PREFIX} Share failed:`, err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading list...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            List Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This list may have been removed or the link is invalid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Go Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Sortid</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <span className="hidden sm:inline text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* List Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ListThemeRenderer
            list={list}
            theme={list.theme || "classic"}
            accentColor={list.accentColor}
            isEditable={false}
          />
        </motion.div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Created with Sortid
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Make Your Own List
          </Link>
        </div>
      </main>
    </div>
  );
}
