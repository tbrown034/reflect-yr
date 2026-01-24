// library/utils/yearUtils.js
// Utilities for parsing year values including decade ranges

/**
 * Parse year value - returns { year, isDecade, startYear, endYear, label }
 * @param {string|number} value - Year value like "2024" or "decade-2020"
 */
export function parseYearValue(value) {
  if (!value) return { year: null, isDecade: false, startYear: null, endYear: null, label: null };

  const valueStr = String(value);

  if (valueStr.startsWith("decade-")) {
    const decadeStart = parseInt(valueStr.replace("decade-", ""));
    return {
      year: null,
      isDecade: true,
      startYear: decadeStart,
      endYear: decadeStart + 9,
      label: `${decadeStart}s`,
    };
  }

  const year = parseInt(valueStr);
  return {
    year,
    isDecade: false,
    startYear: year,
    endYear: year,
    label: valueStr,
  };
}

/**
 * Decade presets for UI selectors
 */
export const DECADE_OPTIONS = [
  { value: "decade-2020", label: "2020s", startYear: 2020 },
  { value: "decade-2010", label: "2010s", startYear: 2010 },
  { value: "decade-2000", label: "2000s", startYear: 2000 },
  { value: "decade-1990", label: "1990s", startYear: 1990 },
];
