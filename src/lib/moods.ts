// Wiqo mood + sub-activity catalog. Single source of truth.

export type ActionLink = {
  label: string;
  href: string;
  kind: "search" | "book" | "watch" | "listen" | "read" | "map" | "ai";
};

import type { NearbyKind } from "@/components/wiqo/NearbyPlaces";

export type SubActivity = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: "links" | "ai" | "mixed";
  // For non-AI activities, helpers that build links given user context.
  buildLinks?: (ctx: { city?: string; lat?: number; lng?: number; dateRange?: string }) => ActionLink[];
  curated?: { title: string; subtitle?: string; href: string; tag?: string }[];
  // Extras: real-time enriched sections rendered on the result page
  trendingMovies?: boolean;
  nearby?: { kinds: NearbyKind[]; title: string };
  instantOrder?: boolean; // Blinkit / Zepto / Instamart quick-buy strip
};

export type Mood = {
  id: string;
  emoji: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  gradient: string; // tailwind gradient classes
  subActivities: SubActivity[];
};

const enc = (s: string) => encodeURIComponent(s);
const mapsNear = (q: string, lat?: number, lng?: number) =>
  lat && lng
    ? `https://www.google.com/maps/search/${enc(q)}/@${lat},${lng},14z`
    : `https://www.google.com/maps/search/${enc(q + " near me")}`;
const ytSearch = (q: string) => `https://www.youtube.com/results?search_query=${enc(q)}`;
const spotifySearch = (q: string) => `https://open.spotify.com/search/${enc(q)}`;
const googleSearch = (q: string) => `https://www.google.com/search?q=${enc(q)}`;
const goodreadsSearch = (q: string) => `https://www.goodreads.com/search?q=${enc(q)}`;

export const MOODS: Mood[] = [
  {
    id: "chill",
    emoji: "🌿",
    name: "Chill / Relax Mode",
    shortName: "Chill",
    tagline: "Do less, feel better",
    description: "When you're tired and just want peace.",
    gradient: "from-emerald-200 via-teal-100 to-cyan-200",
    subActivities: [
      {
        id: "movies",
        title: "Watch movies / Netflix",
        description: "A perfectly soft evening, screen-lit.",
        emoji: "🎬",
        type: "links",
        trendingMovies: true,
        nearby: { kinds: ["cinema"], title: "Theatres near you" },
        buildLinks: () => [
          { label: "Open Netflix", href: "https://www.netflix.com/browse", kind: "watch" },
          { label: "Open Prime Video", href: "https://www.primevideo.com/", kind: "watch" },
          { label: "Find on JustWatch", href: "https://www.justwatch.com/", kind: "search" },
        ],
      },
      {
        id: "reading",
        title: "Reading & journaling",
        description: "Tea, blanket, paper. That's the whole plan.",
        emoji: "📖",
        type: "links",
        buildLinks: () => [
          { label: "Browse Goodreads", href: "https://www.goodreads.com/", kind: "read" },
          { label: "Cozy reading playlist", href: spotifySearch("cozy reading"), kind: "listen" },
          { label: "Journaling prompts", href: googleSearch("best journaling prompts for self reflection"), kind: "search" },
        ],
        curated: [
          { title: "The Midnight Library", subtitle: "Matt Haig", href: goodreadsSearch("The Midnight Library Matt Haig"), tag: "Fiction" },
          { title: "Tiny Beautiful Things", subtitle: "Cheryl Strayed", href: goodreadsSearch("Tiny Beautiful Things Cheryl Strayed"), tag: "Essays" },
          { title: "Bittersweet", subtitle: "Susan Cain", href: goodreadsSearch("Bittersweet Susan Cain"), tag: "Mood" },
          { title: "Klara and the Sun", subtitle: "Kazuo Ishiguro", href: goodreadsSearch("Klara and the Sun"), tag: "Literary" },
        ],
      },
      {
        id: "spa",
        title: "Spa / self-care",
        description: "Soft hands, warm steam, slower breath.",
        emoji: "🛁",
        type: "mixed",
        buildLinks: (ctx) => [
          { label: "Spas near you", href: mapsNear("spa", ctx.lat, ctx.lng), kind: "map" },
          { label: "At-home spa routine (YouTube)", href: ytSearch("at home spa night routine aesthetic"), kind: "watch" },
          { label: "Calm playlist", href: spotifySearch("spa music"), kind: "listen" },
        ],
      },
      {
        id: "doing-nothing",
        title: "Doing absolutely nothing",
        description: "The most underrated weekend plan.",
        emoji: "😌",
        type: "ai",
      },
    ],
  },
  {
    id: "explore",
    emoji: "🧭",
    name: "Explore / Adventure Mode",
    shortName: "Explore",
    tagline: "Go somewhere you've never been",
    description: "When you want something exciting.",
    gradient: "from-orange-200 via-amber-100 to-rose-200",
    subActivities: [
      {
        id: "road-trips",
        title: "Road trips",
        description: "Open road, good playlist, no plan.",
        emoji: "🚗",
        type: "links",
        buildLinks: (ctx) => [
          { label: "Rent on Zoomcar", href: "https://www.zoomcar.com/", kind: "book" },
          { label: "Rent on Turo", href: "https://turo.com/", kind: "book" },
          { label: "Scenic drives nearby", href: mapsNear("scenic drives", ctx.lat, ctx.lng), kind: "map" },
          { label: "Road trip playlist", href: spotifySearch("road trip playlist"), kind: "listen" },
        ],
      },
      {
        id: "trekking",
        title: "Trekking / hiking",
        description: "Boots on. Phone off. Mountains, please.",
        emoji: "🥾",
        type: "links",
        buildLinks: (ctx) => [
          { label: "Trails on AllTrails", href: "https://www.alltrails.com/", kind: "search" },
          { label: "Trekking spots near you", href: mapsNear("trekking trails", ctx.lat, ctx.lng), kind: "map" },
          { label: "What to pack", href: googleSearch("day hike packing list essentials"), kind: "search" },
        ],
      },
      {
        id: "visiting-new-places",
        title: "Visiting new places",
        description: "Wiqo's AI will surface hidden gems.",
        emoji: "📍",
        type: "ai",
      },
      {
        id: "trying-something-new",
        title: "Trying something new",
        description: "Let Wiqo's AI dare you a little.",
        emoji: "✨",
        type: "ai",
      },
    ],
  },
  {
    id: "social",
    emoji: "🎉",
    name: "Social / Party Mode",
    shortName: "Social",
    tagline: "Make memories, not plans",
    description: "When you feel like being around people.",
    gradient: "from-pink-200 via-fuchsia-100 to-purple-200",
    subActivities: [
      {
        id: "parties",
        title: "Parties / clubs",
        description: "Loud nights, soft mornings.",
        emoji: "🪩",
        type: "links",
        buildLinks: (ctx) => [
          { label: "Clubs near you", href: mapsNear("nightclub", ctx.lat, ctx.lng), kind: "map" },
          { label: "Tonight's party playlist", href: spotifySearch("party playlist 2025"), kind: "listen" },
          { label: "Book Uber", href: "https://m.uber.com/", kind: "book" },
        ],
      },
      {
        id: "brunch",
        title: "Brunch with friends",
        description: "Eggs, espresso, gossip.",
        emoji: "🍳",
        type: "links",
        buildLinks: (ctx) => [
          { label: "Brunch spots near you", href: mapsNear("brunch", ctx.lat, ctx.lng), kind: "map" },
          { label: "Best brunch in town", href: googleSearch("best brunch spots near me reviews"), kind: "search" },
        ],
      },
      {
        id: "events",
        title: "Events & concerts",
        description: "Live music, comedy, anything loud.",
        emoji: "🎤",
        type: "links",
        buildLinks: (ctx) => {
          const dateBit = ctx.dateRange ? ` ${ctx.dateRange}` : " this weekend";
          return [
            { label: "Bandsintown", href: `https://www.bandsintown.com/?came_from=257`, kind: "search" },
            { label: "Songkick events", href: `https://www.songkick.com/`, kind: "search" },
            { label: `Concerts near you${dateBit}`, href: googleSearch(`concerts ${ctx.city || "near me"}${dateBit}`), kind: "search" },
            { label: `Events near you${dateBit}`, href: googleSearch(`events ${ctx.city || "near me"}${dateBit}`), kind: "search" },
          ];
        },
      },
      {
        id: "game-nights",
        title: "Game nights",
        description: "Cards, board games, controlled chaos.",
        emoji: "🎲",
        type: "links",
        buildLinks: () => [
          { label: "Best party games", href: googleSearch("best party games for adults game night"), kind: "search" },
          { label: "Buy on Amazon", href: "https://www.amazon.com/s?k=board+games", kind: "book" },
          { label: "Print-and-play games", href: googleSearch("free printable party games"), kind: "search" },
        ],
        curated: [
          { title: "Codenames", subtitle: "Word association classic", href: "https://www.amazon.com/s?k=codenames+game", tag: "4–8 players" },
          { title: "Wavelength", subtitle: "Telepathy in a box", href: "https://www.amazon.com/s?k=wavelength+game", tag: "3–12" },
          { title: "Telestrations", subtitle: "Pictionary + telephone = chaos", href: "https://www.amazon.com/s?k=telestrations", tag: "4–8" },
        ],
      },
    ],
  },
  {
    id: "productive",
    emoji: "🧠",
    name: "Productive / Reset Mode",
    shortName: "Productive",
    tagline: "Reset your life in 48 hours",
    description: "When you want to get your life together.",
    gradient: "from-sky-200 via-indigo-100 to-violet-200",
    subActivities: [
      {
        id: "cleaning",
        title: "Cleaning / organizing",
        description: "Aesthetic clean-with-me energy.",
        emoji: "🧺",
        type: "links",
        buildLinks: () => [
          { label: "Clean-with-me videos", href: ytSearch("aesthetic clean with me sunday reset"), kind: "watch" },
          { label: "Cleaning playlist", href: spotifySearch("cleaning motivation"), kind: "listen" },
          { label: "Organization ideas", href: googleSearch("aesthetic home organization ideas"), kind: "search" },
        ],
      },
      {
        id: "planning-next-week",
        title: "Planning next week",
        description: "Wiqo's AI plans your Monday-self a soft landing.",
        emoji: "🗓",
        type: "ai",
      },
      {
        id: "studying-side-projects",
        title: "Studying / side projects",
        description: "Wiqo's AI surfaces weekend-sized ideas.",
        emoji: "💻",
        type: "ai",
      },
      {
        id: "fitness",
        title: "Fitness routines",
        description: "Move the body, settle the brain.",
        emoji: "🏋️",
        type: "links",
        buildLinks: (ctx) => [
          { label: "Workouts on YouTube", href: ytSearch("30 minute home workout no equipment"), kind: "watch" },
          { label: "Yoga classes near you", href: mapsNear("yoga studio", ctx.lat, ctx.lng), kind: "map" },
          { label: "Gyms near you", href: mapsNear("gym", ctx.lat, ctx.lng), kind: "map" },
          { label: "Workout playlist", href: spotifySearch("workout playlist 2025"), kind: "listen" },
        ],
      },
    ],
  },
  {
    id: "self-growth",
    emoji: "💖",
    name: "Self-growth / Solo Mode",
    shortName: "Self-growth",
    tagline: "Date yourself",
    description: "When you want to focus on yourself.",
    gradient: "from-rose-200 via-pink-100 to-orange-200",
    subActivities: [
      {
        id: "learning",
        title: "Learning something new",
        description: "Pick a tiny obsession for the weekend.",
        emoji: "🎓",
        type: "links",
        buildLinks: () => [
          { label: "Free Coursera courses", href: "https://www.coursera.org/courses?query=free", kind: "read" },
          { label: "Skillshare classes", href: "https://www.skillshare.com/", kind: "watch" },
          { label: "Learn anything (YouTube)", href: ytSearch("learn anything in a weekend"), kind: "watch" },
        ],
      },
      {
        id: "meditation",
        title: "Meditation",
        description: "Sit, breathe, get bored, get free.",
        emoji: "🧘",
        type: "links",
        buildLinks: (ctx) => [
          { label: "Guided meditations", href: ytSearch("10 minute guided meditation"), kind: "watch" },
          { label: "Meditation centers near you", href: mapsNear("meditation center", ctx.lat, ctx.lng), kind: "map" },
          { label: "Calm Spotify playlists", href: spotifySearch("meditation"), kind: "listen" },
        ],
      },
      {
        id: "solo-dates",
        title: "Solo dates",
        description: "Wiqo's AI plans you a beautiful date with you.",
        emoji: "💌",
        type: "ai",
      },
      {
        id: "creative-hobbies",
        title: "Creative hobbies",
        description: "Wiqo's AI surfaces a hobby you can start now.",
        emoji: "🎨",
        type: "ai",
      },
    ],
  },
  {
    id: "foodie",
    emoji: "🍜",
    name: "Foodie Mode",
    shortName: "Foodie",
    tagline: "Eat your way through the weekend",
    description: "When your weekend = food.",
    gradient: "from-amber-200 via-orange-100 to-red-200",
    subActivities: [
      {
        id: "new-cafes",
        title: "Trying new cafes",
        description: "A latte, a croissant, a discovery.",
        emoji: "☕",
        type: "links",
        buildLinks: (ctx) => [
          { label: "New cafes near you", href: mapsNear("new specialty coffee cafe", ctx.lat, ctx.lng), kind: "map" },
          { label: "Top-rated cafes", href: mapsNear("best rated cafe", ctx.lat, ctx.lng), kind: "map" },
        ],
      },
      {
        id: "street-food",
        title: "Street food hunts",
        description: "Pavement, plates, perfect bites.",
        emoji: "🌮",
        type: "links",
        buildLinks: (ctx) => [
          { label: "Street food near you", href: mapsNear("street food", ctx.lat, ctx.lng), kind: "map" },
          { label: "Food markets", href: mapsNear("food market", ctx.lat, ctx.lng), kind: "map" },
        ],
      },
      {
        id: "cooking",
        title: "Cooking experiments",
        description: "Cook something you can't pronounce.",
        emoji: "🍳",
        type: "links",
        buildLinks: () => [
          { label: "Recipes on NYT Cooking", href: "https://cooking.nytimes.com/", kind: "read" },
          { label: "Cooking videos", href: ytSearch("easy weekend dinner recipe"), kind: "watch" },
          { label: "Try a new cuisine", href: googleSearch("authentic recipe from country I have never cooked"), kind: "search" },
        ],
      },
      {
        id: "dessert-hopping",
        title: "Dessert hopping",
        description: "One scoop here, one slice there.",
        emoji: "🍰",
        type: "links",
        buildLinks: (ctx) => [
          { label: "Dessert spots near you", href: mapsNear("dessert", ctx.lat, ctx.lng), kind: "map" },
          { label: "Best ice cream nearby", href: mapsNear("artisan ice cream", ctx.lat, ctx.lng), kind: "map" },
          { label: "Patisseries", href: mapsNear("patisserie", ctx.lat, ctx.lng), kind: "map" },
        ],
      },
    ],
  },
  {
    id: "lazy",
    emoji: "💤",
    name: "Lazy / No-plan Mode",
    shortName: "Lazy",
    tagline: "No plans = best plans",
    description: "When you don't even want to plan.",
    gradient: "from-slate-200 via-zinc-100 to-stone-200",
    subActivities: [
      {
        id: "sleeping",
        title: "Sleeping",
        description: "An olympic sport.",
        emoji: "😴",
        type: "links",
        buildLinks: () => [
          { label: "Sleep stories", href: ytSearch("sleep story rain"), kind: "watch" },
          { label: "Deep sleep playlist", href: spotifySearch("deep sleep"), kind: "listen" },
        ],
      },
      {
        id: "scrolling",
        title: "Scrolling",
        description: "Permission granted.",
        emoji: "📱",
        type: "links",
        buildLinks: () => [
          { label: "Aesthetic Pinterest boards", href: "https://www.pinterest.com/search/pins/?q=aesthetic", kind: "search" },
          { label: "Cozy YouTube rabbit hole", href: ytSearch("cozy aesthetic vlog"), kind: "watch" },
        ],
      },
      {
        id: "doing-nothing-lazy",
        title: "Random spontaneous stuff",
        description: "Wiqo's AI gives you a random nudge.",
        emoji: "🎲",
        type: "ai",
      },
    ],
  },
];

export const findMood = (id: string) => MOODS.find((m) => m.id === id);
export const findSubActivity = (moodId: string, subId: string) =>
  findMood(moodId)?.subActivities.find((s) => s.id === subId);

// Map sub-activity ids to AI prompt keys
export const AI_PROMPT_KEY: Record<string, string> = {
  "doing-nothing": "doing-nothing",
  "doing-nothing-lazy": "doing-nothing",
  "trying-something-new": "trying-something-new",
  "visiting-new-places": "visiting-new-places",
  "planning-next-week": "planning-next-week",
  "studying-side-projects": "studying-side-projects",
  "solo-dates": "solo-dates",
  "creative-hobbies": "creative-hobbies",
};
