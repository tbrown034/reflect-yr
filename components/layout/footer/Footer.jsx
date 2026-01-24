import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full p-6 border-t">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Branding */}
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Sortid. All rights reserved.
        </p>

        {/* Footer Links - All direct to About */}
        <nav className="flex gap-6 text-sm">
          <Link
            href="/about"
            className="hover:underline hover:text-slate-900 dark:hover:text-white"
          >
            Privacy Policy
          </Link>
          <Link
            href="/about"
            className="hover:underline hover:text-slate-900 dark:hover:text-white"
          >
            Terms of Service
          </Link>
          <Link
            href="/about"
            className="hover:underline hover:text-slate-900 dark:hover:text-white"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
