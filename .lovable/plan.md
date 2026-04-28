# Wiqo — Weekend Planner V1

A beautiful, vibe-first weekend planner. Pick a mood, pick the date range, get instant ideas with direct action links (book, watch, listen, navigate).

## Visual direction
- **Palette (Sunset Vibes):** cream `#fff7ed`, sunset orange `#fb923c`, pink `#ec4899`, deep indigo `#1e1b4b`
- **Type:** Instrument Serif (display headings, italic accents) + Work Sans (body)
- **Feel:** editorial magazine meets golden-hour sunset. Warm gradients, generous whitespace, large serif headlines, framer-motion transitions between steps.

## User flow
```text
Landing (hero "Plan your weekends the best way" + Start)
   ↓
Auth (email or phone + password) — Lovable Cloud
   ↓
Step 1: Date range picker (from → to)
   ↓
Step 2: Mood grid (7 moods with taglines)
   ↓
Step 3: Sub-activity grid for chosen mood
   ↓
Step 4: Results page (curated content + deep links + AI where relevant)
   ↓
"Have a great weekend" celebration screen
```

## The 7 moods (exact copy preserved)
Chill • Explore • Social • Productive • Self-growth • Foodie • Lazy — each with the user's taglines.

## Per sub-activity behavior
| Sub-activity | What we show |
|---|---|
| Movies / Netflix | Curated picks + direct Netflix/JustWatch links |
| Reading | Book recs + Goodreads/Amazon links |
| Spa / self-care | YouTube self-care videos + Google Maps "spa near me" deep link |
| Doing nothing | **AI agent** — friendly feel-good ideas |
| Road trips | Zoomcar/Revv booking links + Google Maps destination search |
| Trekking | Google Maps "trekking near me" + AllTrails search |
| Visiting new places | AI suggests, links to Maps |
| Trying something new | **AI agent** suggestions |
| Parties / clubs | Google Maps "clubs near me" + preview cards |
| Brunch | Maps "brunch spots near me" |
| Events / concerts | Bandsintown + Songkick search for the date range + city |
| Game nights | Curated game ideas + Amazon/board-game links |
| Cleaning | Aesthetic YouTube clean-with-me + Spotify playlists |
| Planning next week | **AI agent** (planner) |
| Studying / side projects | **AI agent** (idea generator) |
| Fitness | YouTube workouts + Maps "gym/yoga near me" |
| Learning | Curated YouTube + Coursera search |
| Meditation | YouTube + Maps meditation centers |
| Solo dates | **AI agent** |
| Creative hobbies | **AI agent** + Maps craft cafes |

All "near me" links use the user's geolocation (browser API) when granted, otherwise fall back to a city input.

## AI agent
- Single edge function `weekend-ai` calling Lovable AI Gateway (`google/gemini-3-flash-preview`).
- System prompt adapts by sub-activity (feel-good, planner, idea generator, solo-date curator…).
- Streaming responses with markdown rendering.

## Backend (Lovable Cloud)
- **Auth:** email + password (phone optional via Supabase phone auth — needs Twilio; for V1 we ship email/password and a phone-as-username option).
- **Tables:**
  - `profiles` (id, display_name, phone, location_city) — auto-created on signup
  - `weekend_plans` (id, user_id, start_date, end_date, mood, sub_activity, created_at) — stores history so users can revisit
- RLS: users can only read/write their own rows.
- **Edge function:** `weekend-ai` (streaming AI suggestions).

## Tech notes
- Geolocation via `navigator.geolocation` → reverse-geocoded with a free Nominatim call (no key needed).
- All "search" features open Google with pre-built query URLs (no paid API keys for V1).
- Deep links use canonical URL schemes (no API keys needed): YouTube search, Google Maps search, Spotify search, Netflix search, Goodreads search, Bandsintown.

## Out of scope for V1 (clear next steps)
- Live Google Places nearby cards (needs Places API key)
- Real-time event ticketing inline (needs Ticketmaster/SerpAPI key)
- TMDB-powered movie metadata (needs TMDB key)

I'll wire these in as v2 once you decide on API keys.

## Deliverables this round
1. Lovable Cloud + auth + DB schema
2. Landing, auth, date picker, mood grid, sub-activity grid, results page, celebration screen
3. AI edge function + streaming chat for AI sub-activities
4. Geolocation + deep-link helper
5. Full Sunset Vibes design system in `index.css` + `tailwind.config.ts`
