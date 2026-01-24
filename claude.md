# Sortid - Claude Code Context

> **Naming**: `Sortid` (spoken), `sort(id)` (visual mark), `sort-id` (file naming)

## Project Overview

Sortid is a year-end media list maker and sharer. Users create ranked lists of their favorite movies, TV shows, books, podcasts, and more. Add personal comments/ratings, customize with themes, and share with friends.

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
├── api/
│   ├── tmdb.js             # TMDB API wrapper with 24h caching
│   └── providers/          # Multi-provider abstraction
│       ├── index.js        # Provider registry
│       ├── tmdb.js         # Movies/TV (TMDB)
│       ├── openLibrary.js  # Books (Open Library)
│       ├── itunes.js       # Podcasts (iTunes/Apple)
│       ├── sportsDb.js     # Sports (TheSportsDB)
│       └── types.js        # Category definitions
├── contexts/
│   ├── ListContext.js      # Global list state (localStorage) with themes, watched pool
│   └── YearContext.js      # Year filter state
├── database/neon.js        # Neon serverless connection
└── utils/
    ├── letterboxdParser.js # CSV parsing for Letterboxd exports
    ├── listUtils.js        # List utilities (ID generation, share codes)
    ├── yearUtils.js        # Year/decade parsing utilities
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

**Project Name**: sort-id
**Location**: `~/Desktop/dev/active/reflect-yr` (pending rename to `sort-id`)
**GitHub**: github.com/tbrown034/reflect-yr

This project is part of Trevor Brown's Active workspace:
- Workspace docs: `~/Desktop/dev/active/_docs/`
- Project status: See `_docs/status.md` for all project statuses
- Naming convention: kebab-case

Last updated: 2026-01-23

---

## Devlog

### 2026-01-23 - Decade Filtering, Book Covers, Podcast Years

**Session with Claude Opus 4.5**

Trevor and AI walked through the UI/UX in Chrome, identifying and fixing issues:

#### What We Built

**1. Decade Filtering**
- Added ability to filter by "2020s", "2010s", "2000s", "1990s" on Movies/TV pages
- Created `library/utils/yearUtils.js` with `parseYearValue()` function
- Updated `YearSelector.jsx` with optgroups for Decades vs Years
- TMDB API now supports date ranges (`primary_release_date.gte/lte`)
- Title updates dynamically: "Top Movies of 2000s"

**2. Book Covers Fix**
- Problem: Books section showed almost no covers (1-3 out of 10)
- Root cause: Open Library ISBN-based cover URLs return 1x1 transparent pixels
- Fix: Only use `cover_i` field, filter out books without it, expanded fallback search queries

**3. Podcast Year Filtering**
- Enabled year filtering for podcasts (was disabled)
- Updated `types.js`: `hasYear: true` for podcast category
- iTunes provider now filters by year

**4. About Page Cleanup**
- Removed "Why Sortid?" section that explained the code reference (violates brand guidelines)
- Cleaned up contact info with real email/GitHub

#### Files Changed

| File | Change |
|------|--------|
| `library/utils/yearUtils.js` | NEW - decade parsing utility |
| `library/api/providers/openLibrary.js` | Fixed cover filtering |
| `library/api/providers/types.js` | Enabled podcast years |
| `library/api/providers/itunes.js` | Added year filtering |
| `library/api/tmdb.js` | Added date range support |
| `components/ui/inputs/YearSelector.jsx` | Added decade options |
| `app/(media)/movies/page.jsx` | Added decade parsing |
| `app/about/page.jsx` | Removed branding explanation |

#### Commits

```
7c2bc1b feat: add decade filtering, fix book covers, enable podcast years
99d68a7 chore: sync remaining changes before folder rename
```

#### Technical Notes

- Server Components can't import from Client Components - had to move `parseYearValue` to separate utility file
- Open Library `cover_i` is reliable; ISBN-based covers (`covers.openlibrary.org/b/isbn/...`) often return placeholders
- TMDB uses `primary_release_date.gte/lte` for date ranges, not `primary_release_year`

#### Next Steps

- Folder rename from `reflect-yr` to `sort-id`
- Update `package.json` name
- Improve add-to-list UX (currently "add over add" is confusing)
