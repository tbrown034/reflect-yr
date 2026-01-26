"use client";

import Link from "next/link";
import { ListBulletIcon, PlusIcon } from "@heroicons/react/24/outline";

/**
 * EmptyListsState - Clean empty state
 */
export default function EmptyListsState({ activeTab = "all" }) {
  const getTitle = () => {
    switch (activeTab) {
      case "movies":
        return "No movie lists";
      case "tv":
        return "No TV lists";
      case "books":
        return "No book lists";
      case "podcasts":
        return "No podcast lists";
      case "recs":
        return "No saved recommendations";
      default:
        return "No lists yet";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <ListBulletIcon className="h-6 w-6 text-slate-400" />
      </div>

      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
        {getTitle()}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Create your first ranked list
      </p>

      <Link
        href="/create"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-medium"
      >
        <PlusIcon className="h-4 w-4" />
        New List
      </Link>
    </div>
  );
}
