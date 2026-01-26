"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { DECADE_OPTIONS } from "@/library/utils/yearUtils";

// Main decades shown as pills
const FEATURED_DECADES = ["decade-2020", "decade-2010", "decade-2000"];

export default function YearSelector({
  navigateOnChange = true,
  startYear = 2000,
  endYear = new Date().getFullYear(),
  className = "",
  initialYear = null,
  onYearChange = null,
  selectedYear: controlledYear = null,
  showDecades = true,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedYear, setSelectedYear] = useState(() => {
    const yearFromURL = searchParams.get("year");
    return controlledYear || initialYear || yearFromURL || endYear.toString();
  });

  const handleYearChange = useCallback(
    (newYear) => {
      setSelectedYear(newYear);
      onYearChange?.(newYear);

      if (navigateOnChange) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("year", newYear);
        router.replace(`${pathname}?${newParams}`, { scroll: false });
      }
    },
    [navigateOnChange, onYearChange, pathname, router, searchParams]
  );

  useEffect(() => {
    if (controlledYear && controlledYear !== selectedYear) {
      setSelectedYear(controlledYear);
    }
  }, [controlledYear, selectedYear]);

  const years = Array.from({ length: endYear - startYear + 1 }, (_, index) =>
    (startYear + index).toString()
  ).reverse();

  // Featured decades shown as pills
  const featuredDecades = showDecades
    ? DECADE_OPTIONS.filter((d) => FEATURED_DECADES.includes(d.value))
    : [];

  // Other decades for the "More" dropdown
  const otherDecades = showDecades
    ? DECADE_OPTIONS.filter((d) => !FEATURED_DECADES.includes(d.value))
    : [];

  // Check if current selection is a featured decade
  const isFeaturedDecade = FEATURED_DECADES.includes(selectedYear);
  const isInMore =
    !isFeaturedDecade && (selectedYear.startsWith("decade-") || years.includes(selectedYear));

  // Get display label for "More" when something from it is selected
  const getMoreLabel = () => {
    if (!isInMore) return "More";
    if (selectedYear.startsWith("decade-")) {
      const decade = DECADE_OPTIONS.find((d) => d.value === selectedYear);
      return decade?.label || "More";
    }
    return selectedYear;
  };

  const pillBase =
    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors min-w-[70px] text-center";
  const pillActive = "bg-blue-600 text-white";
  const pillInactive =
    "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600";

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Featured decade pills */}
      {featuredDecades.map((decade) => (
        <button
          key={decade.value}
          type="button"
          onClick={() => handleYearChange(decade.value)}
          className={`${pillBase} ${selectedYear === decade.value ? pillActive : pillInactive}`}
          aria-pressed={selectedYear === decade.value}
        >
          {decade.label}
        </button>
      ))}

      {/* More dropdown - same width as decade pills */}
      <select
        value={isInMore ? selectedYear : ""}
        onChange={(e) => handleYearChange(e.target.value)}
        className={`${pillBase} cursor-pointer appearance-none bg-no-repeat bg-right pr-6 ${
          isInMore ? pillActive : pillInactive
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundSize: "16px",
          backgroundPosition: "right 4px center",
        }}
        aria-label="Select year or decade"
      >
        <option value="" disabled>
          {getMoreLabel()}
        </option>

        {/* Older decades */}
        {otherDecades.length > 0 && (
          <optgroup label="Decades">
            {otherDecades.map((decade) => (
              <option key={decade.value} value={decade.value}>
                {decade.label}
              </option>
            ))}
          </optgroup>
        )}

        {/* Individual years */}
        <optgroup label="Years">
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
