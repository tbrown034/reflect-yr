"use client";

import { useState } from "react";
import { authClient } from "@/library/auth-client";

export const SignInButton = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    console.log("[SignInButton] Starting Google sign-in...");
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/profile",
      });

      if (result?.error) {
        console.error("[SignInButton] Error:", result.error);
        setError(result.error.message || "Sign-in failed");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("[SignInButton] Exception:", err.message);
      setError(err.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  const defaultClassName =
    "flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-5 rounded-md border border-gray-300 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        className={className || defaultClassName}
      >
        {isLoading ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
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
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.8 33.4 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 2.9l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.3-7.7 20.7-18 0.2-1.3 0.3-2.7 0.3-4 0-0.8-0.1-1.5-0.2-2.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.1 16 18.7 13 24 13c3 0 5.8 1.1 7.9 2.9l6-6C34.5 5.1 29.5 3 24 3 15.3 3 8.1 8.5 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 45c5.2 0 10-1.8 13.7-4.9l-6.4-5.3C28.9 36.5 26.5 37 24 37c-5.3 0-9.8-3.5-11.4-8.3l-6.6 5.1C9.9 40.2 16.4 45 24 45z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.2 3.1-3.5 5.4-6.3 6.8l0.1 0.1 6.4 5.3C38.4 36.4 42 30.7 42 24c0-1.5-0.1-2.9-0.4-4.3z"
              />
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};
