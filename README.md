# Chroniq

<p align="center">
  <img src="./public/logo.png" alt="Chroniq Logo" width="120" />
</p>

<h3 align="center">
Track everything you watch and read in one place.
</h3>

<p align="center">
  A modern media-tracking platform for anime, movies, TV shows, and manga.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#development">Development</a> •
  <a href="#license">License</a>
</p>

---

## About

Chroniq is a personal media dashboard that helps users organize, track, and discover anime, movies, TV shows, and manga.

Inspired by platforms like AniList, Trakt, and modern productivity tools, Chroniq combines manual library management with browser-assisted synchronization to create a seamless media experience.

Chroniq does **not** provide streaming, downloads, or piracy-related functionality.

Its purpose is simple:

- Track what you watch.
- Track what you read.
- Keep your progress synchronized.
- Continue where you left off.
- Visualize your history and statistics.

---

# Features

### Library Management

- Track anime, movies, TV shows, and manga.
- Organize titles into custom statuses.
- Update episode and chapter progress.
- Rate and review media.

### Discover

- Unified search experience.
- Browse trending anime and movies.
- Seasonal anime charts.
- Genre and year filtering.

### Dashboard

- Continue Watching.
- Recently Added.
- Currently Airing.
- Trending This Season.
- Activity Feed.

### Statistics

- Total watch time.
- Completion rate.
- Genre breakdown.
- Favorite studios.
- Monthly activity.

### Browser Extension *(Coming Soon)*

- Detect supported websites.
- Sync watch progress automatically.
- Continue watching prompts.
- Site whitelist system.

---

# Screenshots

> Screenshots will be added as development progresses.

| Home | Library | Discover |
|-------|-------|-------|
| Coming Soon | Coming Soon | Coming Soon |

---

# Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Supabase
- PostgreSQL
- Row Level Security

### APIs

#### Anime

- AniList GraphQL API
- Jikan API

#### Movies / TV

- TMDB API

### Hosting

- Vercel

---

# Project Structure

```bash
chroniq/
│
├── app/
├── components/
├── lib/
├── hooks/
├── services/
├── public/
├── styles/
├── supabase/
└── extension/        # Planned
```

---

# Core Navigation

```text
Chroniq

├── Home
├── Discover
├── Library
├── History
├── Stats
└── Settings
```

---

# Roadmap

## Phase 1

- [x] Project architecture
- [x] Database planning
- [ ] Landing page
- [ ] Authentication

## Phase 2

- [ ] Dashboard
- [ ] Discover
- [ ] Search

## Phase 3

- [ ] Library system
- [ ] Progress tracking
- [ ] Media pages

## Phase 4

- [ ] History
- [ ] Statistics
- [ ] Settings

## Phase 5

- [ ] Browser extension
- [ ] Tracked sites
- [ ] Automatic sync

---

# Browser Sync Philosophy

Chroniq only tracks websites explicitly approved by the user.

Example:

```text
Tracked Sites

✓ netflix.com

✓ crunchyroll.com

✓ hidive.com

+ Add Site
```

The extension ignores all websites that are not on the user's whitelist.

---

# Development

Clone the repository:

```bash
git clone https://github.com/itsvoidstack/chroniq.git
```

Move into the project:

```bash
cd chroniq
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Environment Variables

Create:

```bash
.env.local
```

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

TMDB_API_KEY=

ANILIST_API_URL=https://graphql.anilist.co

JIKAN_API_URL=https://api.jikan.moe/v4
```

---

# Design Principles

Chroniq follows a few simple rules:

- Content first.
- No piracy.
- Fast and minimal.
- Beautiful in light and dark mode.
- One consistent experience across all media.

---

# Status

🚧 Under active development.

Chroniq is currently being rebuilt from the ground up.

---

# License

This project is licensed under the MIT License.

---

<p align="center">
Built with ❤️ by VoidStack.
</p>
