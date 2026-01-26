// components/layout/header/HeaderDropDown.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/solid";
import {
  FilmIcon,
  TvIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  PlusCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ui/toggles/DarkModeToggle";

const HeaderDropDown = () => {
  const pathname = usePathname();

  const navItems = [
    { text: "Movies", href: "/movies", icon: FilmIcon },
    { text: "TV Shows", href: "/tv", icon: TvIcon },
    { text: "Search", href: "/explore", icon: MagnifyingGlassIcon },
    { text: "My Lists", href: "/lists", icon: ListBulletIcon },
    { text: "Create List", href: "/create", icon: PlusCircleIcon, highlight: true },
    { text: "About", href: "/about", icon: InformationCircleIcon },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="relative">
      <Menu>
        <MenuButton className="flex items-center justify-center p-3 sm:p-2 min-h-[44px] min-w-[44px] rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <Bars3Icon className="w-6 h-6" />
        </MenuButton>

        <MenuItems className="absolute right-0 w-56 mt-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 flex flex-col gap-1 focus:outline-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <MenuItem
                key={item.href}
                as={Link}
                href={item.href}
                className={`
                  flex items-center gap-3 w-full p-2.5 text-left rounded-md transition-colors
                  ${
                    active
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : item.highlight
                      ? "text-blue-600 dark:text-blue-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }
                `}
              >
                {Icon && <Icon className="h-5 w-5" />}
                {item.text}
              </MenuItem>
            );
          })}

          {/* Theme toggle */}
          <div className="p-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 mt-1 pt-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
};

export default HeaderDropDown;
