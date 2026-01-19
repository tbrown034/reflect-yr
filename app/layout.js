// app/layout.js
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import { YearProvider } from "@/library/contexts/YearContext";
import { ListProvider } from "@/library/contexts/ListContext";
import TempListsSidebar from "@/components/layout/lists/TempListsSidebar";

export const metadata = {
  title: "ReflectYr",
  description: "Your entertainment ranking tool",
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
            <TempListsSidebar />
          </ListProvider>
        </YearProvider>
      </body>
    </html>
  );
}
