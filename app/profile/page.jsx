import { auth } from "@/library/auth";
import { headers } from "next/headers";
import { SignInButton } from "@/components/ui/buttons/actions/SignInButton";
import { SignOut } from "@/components/ui/buttons/actions/SignOutButton";

const isDev = process.env.NODE_ENV === "development";

export default async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (isDev) {
    console.log("[ProfilePage] Session:", session?.user?.email || "none");
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg bg-white dark:bg-gray-900 shadow-md">
      {session?.user ? (
        <div className="space-y-4 text-center">
          {session.user.image && (
            <img
              src={session.user.image}
              alt="User Avatar"
              className="w-20 h-20 rounded-full mx-auto border-2 border-gray-200 dark:border-gray-700"
            />
          )}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {session.user.name || "User"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {session.user.email}
          </p>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <SignOut />
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Welcome to ReflectYr
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to save your lists and access them from any device.
          </p>
          <div className="pt-4">
            <SignInButton />
          </div>
        </div>
      )}
    </div>
  );
}
