// components/layout/header/HeaderNavBar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListBulletIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

const HeaderNavBar = () => {
  const pathname = usePathname();

  // Simplified navigation - just My Lists
  const navItems = [
    {
      text: "My Lists",
      href: "/lists",
      icon: ListBulletIcon,
    },
  ];

  // Check if path matches (handles query params too)
  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              ${
                active
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }
            `}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.text}
          </Link>
        );
      })}

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
