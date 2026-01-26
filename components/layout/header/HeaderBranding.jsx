// components/layout/header/HeaderBranding.jsx
import Link from "next/link";

const HeaderBranding = () => (
  <Link
    href="/"
    className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
    aria-label="sort(id) home"
  >
    {/* Icon mark - visible on mobile, hidden on larger screens */}
    <span
      className="flex sm:hidden items-center justify-center w-8 h-8 rounded-md bg-slate-900 dark:bg-slate-700"
      aria-hidden="true"
    >
      <span className="font-mono text-xs text-slate-400">(</span>
      <span className="font-mono text-xs font-bold text-blue-400">id</span>
      <span className="font-mono text-xs text-slate-400">)</span>
    </span>

    {/* Full wordmark - hidden on mobile, visible on larger screens */}
    <span
      className="hidden sm:flex items-baseline font-mono text-xl tracking-tight"
      aria-hidden="true"
    >
      <span className="text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
        sort
      </span>
      <span className="text-slate-500 dark:text-slate-400">(</span>
      <span className="text-blue-600 dark:text-blue-400 font-semibold">id</span>
      <span className="text-slate-500 dark:text-slate-400">)</span>
    </span>

    {/* Screen reader text */}
    <span className="sr-only">sort(id) - Home</span>
  </Link>
);

export default HeaderBranding;
