const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      // TMDB (movies, TV)
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      // Open Library (books)
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      // TheSportsDB (athletes, events)
      {
        protocol: "https",
        hostname: "www.thesportsdb.com",
      },
      {
        protocol: "https",
        hostname: "r2.thesportsdb.com",
      },
      // MyAnimeList via Jikan (anime)
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
      // iTunes/Apple (podcasts)
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "is2-ssl.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "is3-ssl.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "is4-ssl.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "is5-ssl.mzstatic.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/movies",
        destination: "/Movies",
      },
      {
        source: "/tv",
        destination: "/Tv",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
