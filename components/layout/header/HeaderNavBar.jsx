// components/layout/header/HeaderNavBar.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListBulletIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  FilmIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/outline";

const HeaderNavBar = () => {
  const pathname = usePathname();
  const [browseOpen, setBrowseOpen] = useState(false);
  const browseRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (browseRef.current && !browseRef.current.contains(event.target)) {
        setBrowseOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setBrowseOpen(false);
  }, [pathname]);

  const browseCategories = [
    { text: "Movies", href: "/movies", icon: FilmIcon },
    { text: "TV Shows", href: "/tv", icon: TvIcon },
    { text: "Books", href: "/books", icon: BookOpenIcon },
    { text: "Podcasts", href: "/podcasts", icon: MicrophoneIcon },
  ];

  // Check if path matches (handles query params too)
  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Check if any browse category is active
  const isBrowseActive = browseCategories.some((cat) => isActive(cat.href));

  return (
    <nav className="flex items-center gap-1">
      {/* Browse dropdown */}
      <div className="relative" ref={browseRef}>
        <button
          onClick={() => setBrowseOpen(!browseOpen)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
            ${
              isBrowseActive
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }
          `}
        >
          Browse
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform ${browseOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown menu */}
        {browseOpen && (
          <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
            {browseCategories.map((category) => {
              const Icon = category.icon;
              const active = isActive(category.href);

              return (
                <Link
                  key={category.href}
                  href={category.href}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
                    ${
                      active
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                        : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {category.text}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* My Lists link */}
      <Link
        href="/lists"
        className={`
          flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
          ${
            isActive("/lists")
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
              : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }
        `}
      >
        <ListBulletIcon className="h-4 w-4" />
        My Lists
      </Link>

      {/* Create button - always highlighted */}
      <Link
        href="/create"
        className={`
          flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ml-1
          ${
            isActive("/create")
              ? "bg-blue-700 text-white ring-2 ring-blue-300 dark:ring-blue-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }
        `}
      >
        <PlusCircleIcon className="h-4 w-4" />
        {isActive("/create") ? "Creating" : "Create"}
      </Link>
    </nav>
  );
};

export default HeaderNavBar;
