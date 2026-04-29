<div align="center">

# Wiqo

### Plan your weekends the best way.

A vibe-first weekend planner. Pick a mood. Pick your dates. Get an instant, beautiful plan with everything you need to actually go do it — real places nearby, direct booking links, AI suggestions, and one-tap actions.

[**Live App →**](https://wiqo-theweekendplanner.lovable.app)

</div>

---

## What is Wiqo?

Most weekends die in the group chat. "What do you want to do?" "I don't know, what do *you* want to do?" Two hours later, everyone's still on their phone.

Wiqo fixes that. You tell it your mood — chill, explore, social, foodie, lazy — and it instantly builds a plan around your actual location and the dates you picked. Real spots near you, real distances, real links to book a cab, order food, watch a movie, or hike a trail.

No infinite scrolling. No decision fatigue. Just: mood → plan → go.

## Features

- **7 mood-based planners** — Chill, Explore, Social, Productive, Self-growth, Foodie, Lazy. Each unlocks a curated set of sub-activities.
- **Real places nearby** — Live results from OpenStreetMap with actual distances from your location (cafes, spas, trails, clubs, gyms, theatres, libraries, and more).
- **One-tap transport** — Uber, Ola, and Rapido deep links pre-filled with your chosen drop location.
- **Instant order** — Direct links to Blinkit, Zepto, Instamart, and Amazon for game nights and last-minute essentials.
- **Trending movies** — Live picks with direct links to Netflix, Prime Video, and JustWatch.
- **AI weekend agent** — For open-ended moods ("doing nothing", "solo dates", "trying something new"), an AI agent suggests personal, feel-good ideas in real time.
- **Save your plans** — Auth-backed history so you can revisit what you planned.
- **Beautiful editorial design** — Sunset-vibes palette, Instrument Serif headlines, Framer Motion transitions.
- **Fully responsive** — Mobile-first, works perfectly on phone, tablet, and desktop.

## How it works

```text
Landing  →  Sign in  →  Pick dates  →  Pick mood  →  Pick sub-activity  →  Get your plan
```

Each plan page combines:
1. **Curated content** (movies, books, games, playlists)
2. **Live nearby places** (with real distance from you)
3. **Action links** (book a cab, order food, navigate, watch, listen)
4. **AI suggestions** (where the activity benefits from creativity)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5 |
| Styling | Tailwind CSS v3, shadcn/ui, Framer Motion |
| Routing | React Router v6 |
| State | TanStack Query, React Context |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| AI | Google Gemini (via AI Gateway) |
| Places | OpenStreetMap Overpass API |
| Geo | Browser Geolocation + Nominatim reverse-geocoding |
| Movies | TMDB-style trending feed |

## Project structure

```
src/
├── components/
│   ├── wiqo/         # App-specific components (NearbyPlaces, AIAgent, InstantOrder, TrendingMovies)
│   └── ui/           # shadcn primitives
├── pages/            # Landing, Auth, PlanStart, PlanMood, PlanSubActivity, PlanResult, PlanDone
├── lib/
│   ├── moods.ts      # Single source of truth for moods + sub-activities
│   └── geolocation.ts
├── contexts/         # AuthContext
└── integrations/supabase/

supabase/functions/
├── nearby-places/    # Overpass-powered nearby search
├── trending-movies/  # Live movie picks
└── weekend-ai/       # Streaming AI agent
```

## Running locally

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Test
npm run test
```

You'll need a Supabase project (or compatible backend) with the edge functions deployed. See [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md) for the full setup guide, schema, RLS policies, and API reference.

## Documentation

Full technical and product documentation lives in [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md) — methodology, architecture, every API and tool used, edge function contracts, database schema, and more.

## License

All rights reserved.

---

<div align="center">

Made with care, for weekends that don't suck.

</div>
