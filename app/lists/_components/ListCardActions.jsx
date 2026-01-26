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
        className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${
          visible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        aria-label="List actions"
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-slate-400" />
      </Menu.Button>

      <AnimatePresence>
        <Menu.Items
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20 py-1"
        >
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onShare?.(list);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                  active ? "bg-slate-100 dark:bg-slate-700" : ""
                } text-slate-700 dark:text-slate-300`}
              >
                <ShareIcon className="h-4 w-4" />
                Share
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
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                  active ? "bg-slate-100 dark:bg-slate-700" : ""
                } text-slate-700 dark:text-slate-300`}
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
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                    active ? "bg-slate-100 dark:bg-slate-700" : ""
                  } text-slate-700 dark:text-slate-300`}
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </a>
              );
            }}
          </Menu.Item>

          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.confirm(`Delete "${list.title}"?`)) {
                    onDelete?.(list.id);
                  }
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 ${
                  active ? "bg-slate-100 dark:bg-slate-700" : ""
                }`}
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </AnimatePresence>
    </Menu>
  );
}
