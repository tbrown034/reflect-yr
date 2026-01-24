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
            Whether it’s movies, music, or TV shows, Sortid helps you create
            and display your lists beautifully and share them with ease.
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
          <p className="text-lg">
            Sortid is built using the latest web technologies for speed,
            scalability, and ease of use:
          </p>
          <ul className="text-lg text-left inline-block">
            <li>
              ⚡ <strong>Next.js (App Router v15)</strong> – Optimized for
              performance & server components.
            </li>
            <li>
              🎨 <strong>Tailwind CSS</strong> – Lightweight and flexible
              styling.
            </li>
            <li>
              📡 <strong>PostgreSQL & Prisma</strong> – Robust, scalable
              database with an intuitive ORM.
            </li>
            <li>
              🚀 <strong>Vercel</strong> – Instant deployments and serverless
              functions.
            </li>
            <li>
              🎬 <strong>TMDB API</strong> – Fetches movie and entertainment
              data.
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact</h2>
          <p className="text-lg">
            Have questions, feedback, or collaboration ideas? Reach out via
            email or follow on social media.
          </p>
          <p className="text-lg font-medium mt-2">
            📧 Email:{" "}
            <a href="mailto:your-email@example.com">your-email@example.com</a>
          </p>
          <p className="text-lg font-medium">
            🐦 Twitter:{" "}
            <a href="https://twitter.com/yourhandle" target="_blank" rel="noreferrer">
              @yourhandle
            </a>
          </p>
          <p className="text-lg font-medium">
            💼 GitHub:{" "}
            <a href="https://github.com/tbrown034" target="_blank" rel="noreferrer">
              github.com/tbrown034
            </a>
          </p>
        </section>

        {/* Hiring the Developer */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Hire the Developer</h2>
          <p className="text-lg">
            Looking for a front-end or full-stack developer with expertise in
            Next.js, Tailwind, and performance optimization? Trevor is open to
            freelance and full-time opportunities.
          </p>
          <p className="text-lg font-medium mt-2">
            📩 Reach out via email or LinkedIn to discuss potential projects!
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
