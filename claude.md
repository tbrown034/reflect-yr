# ReflectYr - Claude Code Context

## Project Overview

ReflectYr is a year-end movie list maker and sharer. Users import their watched movies (via Letterboxd or manual search), create ranked lists ("Best of 2024"), add personal comments/ratings, customize with themes, and share with friends.

**Target use case:** Award season - users hear predictions from podcasters, see critics' lists, then want to make and share their own takes.

## Tech Stack

- **Framework**: Next.js 15.5.7 (App Router)
- **UI**: React 19, Tailwind CSS 4, Headless UI, Framer Motion
- **Auth**: NextAuth 5 (beta) with Google OAuth
- **Database**: Neon PostgreSQL (via @auth/neon-adapter, no Prisma schema)
- **APIs**: TMDB (movie/TV data), Anthropic Claude (recommendations)
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Project Structure

```
app/
├── (media)/movies/         # Movie browse and detail pages
├── (media)/tv/             # TV show browse and detail pages
├── api/
│   ├── auth/[...nextauth]/ # NextAuth endpoints
│   ├── recommendations/    # Claude AI recommendations (requires auth)
│   └── search/             # TMDB search endpoint
├── create/                 # List creation wizard
├── compare/                # Side-by-side list comparison
├── lists/                  # User lists, publish, saved recommendations
├── profile/                # User profile page
└── share/[code]/           # Public shareable list view

components/
├── layout/                 # Header, Footer, Hero, TempListsSidebar
└── ui/
    ├── lists/              # Theme components (Classic, PosterGrid, FamilyFeud, Awards, Minimalist)
    ├── LetterboxdImport.jsx # Letterboxd CSV import modal
    └── ThemeSelector.jsx   # Theme and color picker

library/
├── api/tmdb.js             # TMDB API wrapper with 24h caching
├── contexts/
│   ├── ListContext.js      # Global list state (localStorage) with themes, watched pool
│   └── YearContext.js      # Year filter state
├── database/neon.js        # Neon serverless connection
└── utils/
    ├── letterboxdParser.js # CSV parsing for Letterboxd exports
    ├── listUtils.js        # List utilities (ID generation, share codes)
    └── *.test.js           # Unit tests
```

## Key Features (Built This Session)

### Letterboxd Import
- Parse diary.csv, ratings.csv, watched.csv, watchlist.csv
- Drag-and-drop file upload
- Merge/dedupe logic
- Stats preview before import

### Enhanced Lists
- Per-item comments and star ratings (1-5)
- List title and description
- Year filtering
- 6-character shareable codes

### 5 List Themes
1. **Classic** - Numbered list with posters, comments, ratings
2. **Poster Grid** - Visual grid with hover details
3. **Family Feud** - Game show reveal style (click to reveal)
4. **Awards Show** - Winner spotlight with nominees
5. **Minimalist** - Simple text-based list

### Compare Feature
- Select two lists to compare
- Overlap percentage
- Shared movies with rank comparison
- Unique picks for each list

## Development Commands

```bash
pnpm dev       # Start dev server (Turbopack)
pnpm build     # Production build
pnpm start     # Start production server
pnpm lint      # Run ESLint
pnpm test      # Run Jest tests
```

## Environment Variables

```bash
TMDB_API_TOKEN=           # Read access token (v4 auth)
ANTHROPIC_API_KEY=        # For AI recommendations
DATABASE_URL=             # Neon PostgreSQL connection string
AUTH_SECRET=              # Session encryption secret
AUTH_GOOGLE_ID_DEV=       # Google OAuth (development)
AUTH_GOOGLE_SECRET_DEV=
AUTH_GOOGLE_ID_PROD=      # Google OAuth (production)
AUTH_GOOGLE_SECRET_PROD=
```

## Code Conventions

- **Components**: PascalCase, `.jsx` extension
- **Utilities**: camelCase, `.js` extension
- **Server Components**: Default (no directive)
- **Client Components**: `"use client"` at top
- **Styling**: Tailwind utilities, `dark:` prefix for dark mode
- **Logging**: All major operations log with `[ComponentName]` prefix

## Data Structures

### Enhanced List (localStorage)
```javascript
{
  id: "list_abc123_xyz789",
  type: "movie",
  title: "My Best of 2024",
  description: "A year of incredible cinema...",
  year: 2024,
  theme: "classic",
  accentColor: "#3B82F6",
  shareCode: "X7Kp2m",
  isPublic: true,
  publishedAt: "2024-12-09T...",
  items: [{
    id: 693134,
    title: "Dune: Part Two",
    poster_path: "/...",
    rank: 1,
    userRating: 5,
    comment: "Denis Villeneuve delivers a masterpiece",
  }]
}
```

### Watched Pool (localStorage)
```javascript
{
  movies: [{
    id: "lb-123...",
    title: "Dune",
    year: 2021,
    rating: 4.5,
    watchedDate: "2021-10-22",
    source: "letterboxd",
    needsTmdbMatch: true,
  }],
  tv: [...]
}
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/movies` | Browse movies |
| `/tv` | Browse TV shows |
| `/lists` | View all user lists |
| `/create` | Create new list wizard |
| `/compare` | Compare two lists |
| `/share/[code]` | Public shared list |
| `/profile` | User profile (requires auth) |

## Security Notes

- Recommendations API requires authentication
- Middleware scoped to `/profile` and `/api/recommendations`
- TMDB tokens kept server-side only
- Share codes avoid ambiguous characters (0, 1, I, l, O)

## Remaining Work

See `TODO.md` for full roadmap. Key items:
- Friend invite system
- Social share images (OG tags)
- Cloud sync for logged-in users
- Public list discovery

---

## Workspace Context

**Project Name**: reflectyr
**Location**: `~/Desktop/ActiveProjects/reflectyr`
**GitHub**: github.com/tbrown034/reflectyr

This project is part of Trevor Brown's ActiveProjects workspace:
- Workspace docs: `~/Desktop/ActiveProjects/_docs/`
- Project status: See `_docs/status.md` for all project statuses
- Naming convention: kebab-case

Last updated: 2026-01-08
