"use client";

import { useState } from "react";
import { authClient } from "@/library/auth-client";
import { useRouter } from "next/navigation";

export const SignOut = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    console.log("[SignOutButton] Starting sign-out...");
    setIsLoading(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            console.log("[SignOutButton] Sign-out successful");
            router.push("/");
            router.refresh();
          },
          onError: (error) => {
            console.error("[SignOutButton] Error:", error);
            setIsLoading(false);
          },
        },
      });
    } catch (err) {
      console.error("[SignOutButton] Exception:", err.message);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Signing out...</span>
        </>
      ) : (
        <span>Sign Out</span>
      )}
    </button>
  );
};
