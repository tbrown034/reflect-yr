/**
 * Responsive Design System for Sortid
 * Mobile-first breakpoint patterns using Tailwind CSS
 *
 * Breakpoints (Tailwind defaults):
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */

// Typography scale (mobile-first, scales up)
export const typography = {
  // Headings
  h1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
  h2: "text-xl sm:text-2xl md:text-3xl",
  h3: "text-lg sm:text-xl md:text-2xl",
  h4: "text-base sm:text-lg md:text-xl",

  // Body text
  body: "text-sm sm:text-base",
  bodyLarge: "text-base sm:text-lg",
  caption: "text-xs sm:text-sm",

  // Display (hero, brand)
  display: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
};

// Spacing scale (mobile-first gaps and padding)
export const spacing = {
  // Container padding
  containerPx: "px-3 sm:px-4 md:px-6",
  containerPy: "py-4 sm:py-6 md:py-8",

  // Section padding
  sectionPy: "py-6 sm:py-8 md:py-12",

  // Card padding
  cardP: "p-3 sm:p-4 md:p-5",
  cardPCompact: "p-2 sm:p-3 md:p-4",

  // Grid gaps
  gridGap: "gap-3 sm:gap-4 md:gap-6",
  gridGapCompact: "gap-2 sm:gap-3 md:gap-4",

  // Stack gaps (vertical spacing)
  stackGap: "space-y-3 sm:space-y-4 md:space-y-6",
  stackGapCompact: "space-y-2 sm:space-y-3 md:space-y-4",
};

// Touch targets (minimum 44px on mobile per Apple/Google guidelines)
export const touchTargets = {
  button: "min-h-[44px] min-w-[44px]",
  buttonSm: "min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]",
  iconButton: "p-3 sm:p-2.5", // 44px+ touch area on mobile
  navLink: "px-3 py-3 sm:py-2", // Full-width tap targets on mobile
};

// Container max-widths
export const containers = {
  content: "max-w-6xl mx-auto",
  narrow: "max-w-2xl mx-auto",
  wide: "max-w-7xl mx-auto",
  full: "max-w-full mx-auto",
};

// Grid column patterns
export const grids = {
  // Standard media card grids
  mediaCards: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  mediaCardsCompact: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",

  // List cards (fewer columns, larger cards)
  listCards: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3",

  // Stats/feature grids
  stats: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
};

// Card styling patterns
export const cards = {
  base: "bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700",
  interactive: "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1",
  shadow: "shadow-md sm:shadow-xl",
};

/**
 * Hook to check if user prefers reduced motion
 * Use in client components: const prefersReducedMotion = useReducedMotion();
 */
export function useReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get animation props that respect reduced motion preference
 * @param {Object} fullMotion - Full animation props
 * @param {Object} reducedMotion - Reduced animation props (defaults to simple fade)
 * @returns {Object} Animation props based on user preference
 */
export function getMotionProps(fullMotion, reducedMotion = { initial: { opacity: 0 }, animate: { opacity: 1 } }) {
  if (typeof window === "undefined") return fullMotion;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return prefersReduced ? reducedMotion : fullMotion;
}
