"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { ListThemeRenderer } from "@/components/ui/lists";

/**
 * ListPreviewModal - Modal showing a preview of the list with its selected theme
 */
export default function ListPreviewModal({ list, isOpen, onClose }) {
  if (!list) return null;

  const type = list.type === "movie" ? "movies" : list.type === "tv" ? "tv" : list.type;
  const editUrl = `/lists/${type}/publish/${list.id}`;

  // Limit preview to first 5 items
  const previewList = {
    ...list,
    items: list.items?.slice(0, 5) || [],
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                  <Dialog.Title className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Preview: {list.title}
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    <Link
                      href={editUrl}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">View Full</span>
                    </Link>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Close preview"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Preview content */}
                <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                  <ListThemeRenderer
                    list={previewList}
                    itemType={list.type}
                    isEditable={false}
                  />

                  {list.items?.length > 5 && (
                    <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Showing 5 of {list.items.length} items.{" "}
                      <Link
                        href={editUrl}
                        onClick={onClose}
                        className="text-blue-600 hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
