export const metadata = {
  title: "About",
};

const About = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* About header with brand */}
        <section>
          <h1 className="text-4xl mb-4">
            About{" "}
            <span className="font-mono">
              sort(
              <span className="text-blue-600 dark:text-blue-400">id</span>)
            </span>
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            A sleek platform for curating and sharing your favorite
            entertainment picks of the year. Whether it's movies, music, or TV
            shows, create and display your lists beautifully and share them with
            ease.
          </p>
        </section>

        {/* What We Do */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">What We Do</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Rank your favorites. Share your taste. Compare with friends. Create
            beautiful, shareable lists of the entertainment you love — movies,
            TV, anime, books, and podcasts.
          </p>
        </section>

        {/* Privacy Policy */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Privacy Policy</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Your privacy matters. We don't sell or share your data with third
            parties. Authentication features ensure secure account management,
            and all personal information is handled responsibly.
          </p>
        </section>

        {/* Terms of Service */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Terms of Service</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            By using this service, you agree to abide by our community
            guidelines. Users are expected to share appropriate content and
            respect copyright laws.
          </p>
        </section>

        {/* About the Developer */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">About the Developer</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Built by Trevor Brown, a web developer passionate about clean UI/UX,
            performance optimization, and seamless user experiences. This
            project showcases modern web technologies and intuitive design.
          </p>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Tech Stack</h2>
          <p className="text-lg mb-4 text-slate-700 dark:text-slate-300">
            Built with modern web technologies for speed and reliability.
          </p>
          <ul className="text-lg text-left inline-block space-y-1 text-slate-700 dark:text-slate-300">
            <li>
              <strong>Next.js 16</strong> — App Router, server components
            </li>
            <li>
              <strong>Tailwind CSS 4</strong> — Utility-first styling
            </li>
            <li>
              <strong>PostgreSQL</strong> — Scalable database via Neon
            </li>
            <li>
              <strong>Vercel</strong> — Edge deployment
            </li>
            <li>
              <strong>TMDB API</strong> — Movie and TV data
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact</h2>
          <p className="text-lg mb-4 text-slate-700 dark:text-slate-300">
            Questions, feedback, or collaboration ideas?
          </p>
          <div className="flex flex-col gap-2 text-lg">
            <a
              href="mailto:trevorbrown.web@gmail.com"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              trevorbrown.web@gmail.com
            </a>
            <a
              href="https://github.com/tbrown034/reflect-yr"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
