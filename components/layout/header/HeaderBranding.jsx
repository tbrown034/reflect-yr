// components/layout/header/HeaderBranding.jsx
import Link from "next/link";

const HeaderBranding = () => (
  <Link
    href="/"
    className="flex items-center p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
    aria-label="Sortid home"
  >
    <span className="font-mono text-xl tracking-tight text-slate-900 dark:text-white">
      sort(<span className="text-blue-600 dark:text-blue-400">id</span>)
    </span>
  </Link>
);

export default HeaderBranding;
