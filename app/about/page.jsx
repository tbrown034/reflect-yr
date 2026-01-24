const About = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* About Sortid */}
        <section>
          <h1 className="text-4xl mb-4">About Sortid</h1>
          <p className="text-lg">
            Sortid is a sleek, user-friendly platform that allows you to
            curate and share your favorite entertainment picks of the year.
            Whether it's movies, music, or TV shows, Sortid helps you create
            and display your lists beautifully and share them with ease.
          </p>
        </section>

        {/* What Sortid Does */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">What We Do</h2>
          <p className="text-lg">
            Rank your favorites. Share your taste. Compare with friends.
            Sortid makes it easy to create beautiful, shareable lists of the
            entertainment you love — movies, TV, anime, books, and podcasts.
          </p>
        </section>

        {/* Privacy Policy */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Privacy Policy</h2>
          <p className="text-lg">
            Your privacy matters to us. Sortid does not sell or share your
            data with third parties. Future authentication features will ensure
            secure account management, and all personal information will be
            handled responsibly.
          </p>
        </section>

        {/* Terms of Service */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Terms of Service</h2>
          <p className="text-lg">
            By using Sortid, you agree to abide by our community guidelines.
            Users are expected to share appropriate content and respect
            copyright laws. Future authentication features will include
            account-specific terms.
          </p>
        </section>

        {/* About the Developer */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">About the Developer</h2>
          <p className="text-lg">
            Sortid is built by Trevor Brown, a web developer passionate about
            clean UI/UX, performance optimization, and seamless user
            experiences. The project is a showcase of modern web technologies
            and intuitive design.
          </p>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Tech Stack</h2>
          <p className="text-lg mb-4">
            Built with modern web technologies for speed and reliability.
          </p>
          <ul className="text-lg text-left inline-block space-y-1">
            <li><strong>Next.js 16</strong> — App Router, server components</li>
            <li><strong>Tailwind CSS</strong> — Utility-first styling</li>
            <li><strong>PostgreSQL</strong> — Scalable database</li>
            <li><strong>Vercel</strong> — Edge deployment</li>
            <li><strong>TMDB API</strong> — Movie and TV data</li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact</h2>
          <p className="text-lg mb-4">
            Questions, feedback, or collaboration ideas?
          </p>
          <div className="flex flex-col gap-2 text-lg">
            <a
              href="mailto:trevorbrown.web@gmail.com"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              trevorbrown.web@gmail.com
            </a>
            <a
              href="https://github.com/tbrown034"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              github.com/tbrown034
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
