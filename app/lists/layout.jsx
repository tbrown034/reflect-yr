// Layout for lists pages with metadata
export const metadata = {
  title: "My Lists | sort(id)",
  description: "View and manage your ranked lists of movies, TV shows, books, and more.",
};

export default function ListsLayout({ children }) {
  return <div className="min-h-screen">{children}</div>;
}
