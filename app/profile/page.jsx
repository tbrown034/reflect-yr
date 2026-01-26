import { auth } from "@/library/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { SignInButton } from "@/components/ui/buttons/actions/SignInButton";
import { SignOut } from "@/components/ui/buttons/actions/SignOutButton";

export default async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      {session?.user ? (
        <div className="text-center">
          {session.user.image && (
            <img
              src={session.user.image}
              alt=""
              className="w-16 h-16 rounded-full mx-auto border border-slate-200 dark:border-slate-700"
            />
          )}
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">
            {session.user.name || "User"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {session.user.email}
          </p>

          <div className="mt-6 space-y-2">
            <Link
              href="/lists"
              className="block w-full px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-medium"
            >
              My Lists
            </Link>
            <Link
              href="/create"
              className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Create List
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <SignOut />
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">
            Sign in to Sortid
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Save lists and access them anywhere.
          </p>
          <div className="mt-6">
            <SignInButton />
          </div>
        </div>
      )}
    </div>
  );
}
