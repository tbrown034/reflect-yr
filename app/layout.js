// app/layout.js
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import { YearProvider } from "@/library/contexts/YearContext";
import { ListProvider } from "@/library/contexts/ListContext";

export const metadata = {
  title: {
    default: "sort(id) - Rank Your Favorites",
    template: "%s | sort(id)",
  },
  description:
    "Create and share ranked lists of your favorite movies, TV shows, books, and podcasts. Discover your taste, compare with friends, and share your picks.",
  keywords: [
    "movie lists",
    "TV rankings",
    "best of 2024",
    "letterboxd alternative",
    "ranked lists",
    "media tracker",
  ],
  authors: [{ name: "Trevor Brown", url: "https://trevorthewebdeveloper.com" }],
  creator: "Trevor Brown",
  metadataBase: new URL("https://reflectyr.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "sort(id)",
    title: "sort(id) - Rank Your Favorites",
    description:
      "Create and share ranked lists of your favorite movies, TV shows, books, and podcasts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "sort(id) - Rank Your Favorites",
    description:
      "Create and share ranked lists of your favorite movies, TV shows, books, and podcasts.",
    creator: "@tbrown034",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen p-2 bg-slate-100  dark:bg-slate-800  dark:text-white">
        <YearProvider>
          <ListProvider>
            <Header />
            <main className="grow">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>
            <Footer />
          </ListProvider>
        </YearProvider>
      </body>
    </html>
  );
}
