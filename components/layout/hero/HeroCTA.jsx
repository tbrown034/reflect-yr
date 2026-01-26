// components/layout/hero/HeroCTA.jsx
// Simple CTA buttons - no dropdown confusion

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function HeroCTA() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Primary CTA - goes straight to create */}
      <Link
        href="/create"
        className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all cursor-pointer"
      >
        Start a List
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
