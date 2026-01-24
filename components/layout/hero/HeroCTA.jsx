import Link from "next/link";
import HeroGetStarted from "./HeroButtons/HeroGetStarted";

export default function HeroCTA() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      <HeroGetStarted />
      <Link
        href="/lists"
        className="rounded-lg px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 active:scale-[0.98] cursor-pointer shadow-md transform bg-white dark:bg-slate-700 text-slate-700 border border-slate-400 hover:bg-slate-100 hover:border-slate-500 dark:text-slate-200 dark:border-slate-500 dark:hover:bg-slate-600 dark:hover:border-slate-400 hover:shadow-lg focus-visible:ring-slate-500"
      >
        Explore Lists
      </Link>
    </div>
  );
}
