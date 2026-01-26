"use client";

import { Menu } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EllipsisVerticalIcon,
  ShareIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

/**
 * ListCardActions - Kebab menu with quick actions for list cards
 */
export default function ListCardActions({
  list,
  onDelete,
  onShare,
  onPreview,
  visible = false,
}) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={`p-2 sm:p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${
          visible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        aria-label="List actions"
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </Menu.Button>

      <AnimatePresence>
        <Menu.Items
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-0 mt-1 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden"
        >
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onShare?.(list);
                  }}
                  className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm ${
                    active
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <ShareIcon className="h-4 w-4" />
                  Copy Link
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPreview?.(list);
                  }}
                  className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm ${
                    active
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <EyeIcon className="h-4 w-4" />
                  Preview
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => {
                const type = list.type === "movie" ? "movies" : list.type === "tv" ? "tv" : list.type;
                return (
                  <a
                    href={`/lists/${type}/publish/${list.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm ${
                      active
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </a>
                );
              }}
            </Menu.Item>

            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm(`Delete "${list.title}"? This cannot be undone.`)) {
                      onDelete?.(list.id);
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm text-red-600 dark:text-red-400 ${
                    active ? "bg-red-50 dark:bg-red-900/20" : ""
                  }`}
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </AnimatePresence>
    </Menu>
  );
}
