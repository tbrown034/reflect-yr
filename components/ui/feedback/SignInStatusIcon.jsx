import { auth } from "@/library/auth";
import { headers } from "next/headers";
import { UserIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const isDev = process.env.NODE_ENV === "development";

export default async function SignInStatusIcon() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isSignedIn = !!session?.user;

  if (isDev) {
    console.log("[SignInStatusIcon] isSignedIn:", isSignedIn);
  }

  const iconSize = "w-5 h-5";

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-400 dark:border-slate-600
                  dark:bg-slate-800
                 hover:bg-slate-100 dark:hover:bg-slate-700
                 active:bg-slate-200 dark:active:bg-slate-600
                 transition-colors duration-150 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
      title={isSignedIn ? "View your profile" : "Sign in to your account"}
    >
      {isSignedIn ? (
        <>
          <UserCircleIcon
            className={`${iconSize} text-blue-600 dark:text-blue-400`}
          />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Profile
          </span>
        </>
      ) : (
        <>
          <UserIcon
            className={`${iconSize} text-slate-500 dark:text-slate-400`}
          />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Sign In
          </span>
        </>
      )}
    </Link>
  );
}
