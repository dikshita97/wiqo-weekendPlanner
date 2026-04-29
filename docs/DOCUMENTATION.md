# Wiqo Weekend Planner

## 1. Product overview

Wiqo is a weekend-planning web application designed to help users quickly choose and execute a weekend plan based on their mood. Instead of giving only generic suggestions, the app combines mood-based planning, real nearby places, direct action links, AI assistance(FREINDLY), movie discovery, delivery links, and transport links.

The core promise is: choose a vibe, choose a sub-activity, and Wiqo turns it into an executable weekend plan.

## 2. User journey

1. User lands on the app and signs in.
2. User selects weekend dates and can share their current location.
3. User chooses a mood, such as Chill, Explore, Social, Productive, Self-growth, Foodie, or Lazy.
4. User chooses a sub-category, such as movies, spa, trekking, parties, game nights, cafes, street food, fitness, etc.
5. Wiqo shows:
   - The selected weekend plan.
   - AI-generated suggestions where relevant.
   - Real nearby places where location-based execution is useful.
   - Real distance from the user’s current location.
   - Direct links for Maps, Uber, Ola, Rapido, booking/search, streaming, ordering, or discovery.
6. User selects a place and sees transport/action links.
7. User finishes the flow and sees a final “Have a great weekend” style completion screen.

## 3. Frontend technologies

- React 18 for the application UI.
- TypeScript for type-safe app logic.
- Vite for local development and bundling.
- Tailwind CSS for styling.
- shadcn/ui component foundations.
- Framer Motion for polished UI animations.
- Lucide React for icons.
- date-fns for date formatting.

## 4. Backend / cloud architecture

The app uses Lovable Cloud backend functions for server-side logic. This is important because browser-side calls to public map APIs can fail due to CORS, browser restrictions, rate limits, or unstable third-party endpoints.

Backend functions currently include:

- `nearby-places`: finds nearby real-world venues and calculates distance.
- `trending-movies`: fetches current movie recommendations and streaming-platform links.
- `weekend-ai`: powers AI planning and follow-up chat.

## 5. Location methodology

The app asks the browser for the user’s current location using the browser Geolocation API.

Stored location fields:

- Latitude
- Longitude
- City when reverse-geocoding succeeds
- Country when reverse-geocoding succeeds

The location is used only to improve recommendations and calculate real distances.

## 6. Nearby places methodology

Nearby places are fetched from backend logic, not directly from the browser.

Main data sources:

- OpenStreetMap data through Overpass API.
- Nominatim search fallback when Overpass returns too few results or fails.

Why this method:

- It avoids browser CORS problems.
- It lets the app use POST requests for Overpass queries.
- It allows category-specific mapping.
- It allows fallback search when map infrastructure is temporarily busy.
- It lets the backend calculate and return real distance before displaying results.

## 7. Subcategory-to-map query mapping

The backend maps app subcategories to OpenStreetMap tags.

Examples:

- Movies / theatres: `amenity=cinema`
- Spa / self-care: `leisure=spa`, `amenity=spa`, `shop=massage`, `leisure=wellness`, `shop=beauty`
- Parties / clubs: `amenity=nightclub`, `club`, `amenity=bar`, `amenity=pub`
- Fitness: `leisure=fitness_centre`, `leisure=sports_centre`, `sport=yoga`
- Cafes: `amenity=cafe`
- Street food: fast-food counters, food courts, markets, kiosks, and cuisine tags associated with chaat, kebabs, rolls, momos, dosa, vada, pav, and snack-style foods
- Trekking / hiking: hiking routes, named paths/tracks, peaks, ridges, cliffs, saddles, viewpoints, and trail-like routes within a wider outskirts radius

## 8. Real distance calculation

The backend calculates real distance from the user’s current coordinates to each place using the Haversine formula.

This gives distance “as the crow flies” in kilometers. It is not traffic-aware driving distance, but it is reliable for ranking nearby places and showing approximate proximity.

Each nearby place card displays distance like:

- `0.5 km away`
- `6.3 km away`
- `12.2 km away`

## 9. Transport / get-there links

When a user selects a place, Wiqo shows transport links:

- Uber: opens Uber with the selected place as the drop location using latitude, longitude, and place name.
- Ola: opens Ola booking with drop latitude, drop longitude, and drop name.
- Rapido: uses a mobile intent-style deep link with a Maps fallback, because Rapido’s public web deep-link behavior is less standardized than Uber/Ola.
- Google Maps: opens directions to the selected place.

These links are generated dynamically from the place the user selects. No destination is hardcoded.

## 10. Movies / streaming methodology

For the movies / Netflix section, Wiqo uses a backend function to fetch trending or buzzy movie suggestions and displays platform badges/links where available.

Platforms shown can include:

- Netflix
- Prime Video
- Disney+
- Other streaming or discovery providers where relevant

The app also includes direct links to Netflix, Prime Video, and JustWatch for execution.

## 11. Game night methodology

For Game Nights, Wiqo provides quick-order links for games and party supplies.

Services included:

- Blinkit
- Zepto
- Swiggy Instamart
- Amazon

Instant-delivery services show fast-order copy. Amazon does not show “Order in 10 minutes” because it is not an instant-delivery service.

## 12. AI assistant methodology

The app includes an AI planning assistant for subcategories that benefit from personalization.

The AI assistant can:

- Suggest plans.
- Adapt to the selected activity.
- Use the weekend date range.
- Use the city when available.
- Support follow-up questions through chat history.

This creates a more personal planning experience instead of static recommendations only.

## 13. Data persistence

Authenticated users can have weekend plan selections saved in the backend database.

Saved plan fields include:

- User
- Start date
- End date
- Mood
- Sub-activity

The application uses authenticated access rules so users only work with their own plans.

## 14. Design system

The app uses a sunset-inspired aesthetic selected for the V1 direction.

Design direction:

- Beautiful, aesthetic, attractive weekend-planning interface.
- Editorial-modern typography feel.
- Soft cards, warm gradients, and polished motion.
- Mobile-friendly layout.
- Clear action sections such as “Make it real,” “Near you,” and final confirmation.

## 15. Current improvements completed

Recent fixes include:

- Spa results now use broader spa/wellness/beauty/massage mapping.
- Trekking no longer defaults to parks; it searches trails, viewpoints, peaks, paths, and outskirts hiking-like places.
- Nearby sections show real distance from the current location.
- Parties / clubs now includes “Clubs near me” in Make it Real.
- Street food now focuses on street-food-style places and filters obvious chain results.
- Uber/Ola/Rapido links now use the selected place as destination/drop location where supported.
- Amazon no longer says “Order in 10 minutes” in Game Nights.

## 16. APIs and external services used

- Browser Geolocation API: gets user location after permission.
- Nominatim reverse geocoding/search: resolves city and fallback place search.
- Overpass API: queries OpenStreetMap venue data.
- Google Maps links: maps search and directions.
- Uber deep links: ride destination setup.
- Ola booking links: drop-location setup.
- Rapido intent/fallback link: ride app opening where supported.
- Streaming/discovery links: Netflix, Prime Video, JustWatch.
- Quick-commerce links: Blinkit, Zepto, Swiggy Instamart.
- AI backend: personalized planning and movie-style recommendations.

## 17. Important limitations to explain honestly

- Nearby places depend on OpenStreetMap data quality. Some areas have richer data than others.
- Distances are approximate straight-line distances, not live traffic distance.
- Ride-app deep links differ by platform and device. Uber and Ola are more predictable; Rapido uses an app-intent approach with Maps fallback.
- Streaming availability can change by country and time, so platform links should be treated as discovery/execution links.

## 18. Why the architecture is strong for V1

- Fast to use.
- Mobile-first.
- Real-world executable links, not just suggestions.
- Backend map calls avoid browser failures.
- AI assistant makes the experience feel personalized.
- Mood-to-subactivity structure is easy to expand.
- New APIs can be added later without rewriting the user experience.

## 19. Suggested future upgrades

- Add a production-grade places provider such as Google Places API if budget allows.
- Add live route duration and traffic-aware ETA.
- Add booking APIs for restaurants, events, spas, and movie tickets.
- Add user favorites and saved weekend history.
- Add shareable weekend plans.
- Add ratings, open/closed status, photos, and price level.
- Add city-specific curated content for stronger quality in sparse map-data areas.
