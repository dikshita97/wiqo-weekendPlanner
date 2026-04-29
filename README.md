<div align="center">

<img src="https://i.pinimg.com/736x/3a/5f/38/3a5f38cd8084942e4cf147f534a1672c.jpg" height="300" width="300" />

# Wiqo

### *Plan your weekends the best way.*

**A vibe-first weekend planner.** Pick a mood. Pick your dates.
Get an instant, beautiful plan with everything you need to actually go do it.

[![Live App](https://img.shields.io/badge/✨_Try_it_live-fb923c?style=for-the-badge&logoColor=white)](https://wiqo-theweekendplanner.lovable.app)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white)

---

</div>

## 💭 The story

> Most weekends die in the group chat.
> *"What do you wanna do?"*
> *"I dunno, what do **you** wanna do?"*
> Two hours later, everyone's still on their phone.

**Wiqo fixes that.** ✨

You tell it your mood — *chill, explore, social, foodie, lazy* — and it instantly builds a plan around your **actual location** and the **dates you picked**. Real spots near you. Real distances. Real links to book a cab, order food, watch a movie, or hike a trail.

No infinite scrolling. No decision fatigue. Just: **mood → plan → go.**

---

## 🎨 Pick a mood, get a weekend

<div align="center">

| 🌿 | 🧭 | 🎉 | 🧠 | 💖 | 🍜 | 💤 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Chill** | **Explore** | **Social** | **Productive** | **Self-growth** | **Foodie** | **Lazy** |
| *Do less,*<br>*feel better* | *Go somewhere*<br>*new* | *Make memories,*<br>*not plans* | *Reset your life*<br>*in 48 hours* | *Date*<br>*yourself* | *Eat your way*<br>*through* | *No plans =*<br>*best plans* |

</div>

---

## ✨ What's inside

<table>
<tr>
<td width="50%" valign="top">

### 📍 Real places, real distances
Live results from OpenStreetMap with actual distance from your location — cafes, spas, trails, clubs, gyms, theatres, libraries.

### 🚕 One-tap transport
**Uber**, **Ola**, and **Rapido** deep links pre-filled with your chosen drop location.

### 🛒 Instant order
Direct links to **Blinkit**, **Zepto**, **Instamart**, and **Amazon** for game nights and last-minute essentials.

### 🎬 Trending movies
Live picks with direct links to **Netflix**, **Prime Video**, and **JustWatch**.

</td>
<td width="50%" valign="top">

### 🤖 AI weekend agent
For open-ended moods — *"doing nothing"*, *"solo dates"*, *"trying something new"* — an AI agent suggests personal ideas in real time.

### 💾 Save your plans
Auth-backed history so you can revisit what you planned.

### 🎨 Editorial design
Sunset-vibes palette • Instrument Serif headlines • Framer Motion transitions.

### 📱 Fully responsive
Mobile-first. Works perfectly on phone, tablet, and desktop.

</td>
</tr>
</table>

---

## 🌊 How it works

```text
   Landing  →  Sign in  →  Pick dates  →  Pick mood  →  Pick activity  →  Your plan
      🌅          🔐           📅            🎨            ✨              🎁
```

Every plan page combines **four magical layers**:

```
┌─────────────────────────────────────────────────────────┐
│  🎯 Curated content     →  movies, books, games, songs  │
│  📍 Live nearby places  →  with real distance from you  │
│  🔗 Action links        →  book, order, watch, listen   │
│  🤖 AI suggestions      →  where creativity matters     │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech stack

<div align="center">

| Layer | Technology |
|:---|:---|
| 🎨 **Frontend** | React 18 · Vite 5 · TypeScript 5 |
| 💅 **Styling** | Tailwind CSS · shadcn/ui · Framer Motion |
| 🧭 **Routing** | React Router v6 |
| 🔄 **State** | TanStack Query · React Context |
| 🗄️ **Backend** | Supabase (Postgres · Auth · Edge Functions) |
| 🤖 **AI** | Google Gemini via AI Gateway |
| 🗺️ **Places** | OpenStreetMap Overpass API |
| 📍 **Geo** | Browser Geolocation · Nominatim |
| 🎬 **Movies** | TMDB-style trending feed |

</div>

---

## 📁 Project structure

```
🌅 wiqo/
├── 📂 src/
│   ├── 📂 components/
│   │   ├── wiqo/         ✨ App-specific (NearbyPlaces, AIAgent, InstantOrder, TrendingMovies)
│   │   └── ui/           🎨 shadcn primitives
│   ├── 📂 pages/         📄 Landing, Auth, PlanStart, PlanMood, PlanSubActivity, PlanResult
│   ├── 📂 lib/
│   │   ├── moods.ts      🎭 Single source of truth for moods + sub-activities
│   │   └── geolocation.ts
│   ├── 📂 contexts/      🔐 AuthContext
│   └── 📂 integrations/supabase/
│
└── 📂 supabase/functions/
    ├── nearby-places/    📍 Overpass-powered nearby search
    ├── trending-movies/  🎬 Live movie picks
    └── weekend-ai/       🤖 Streaming AI agent
```

---

## 🚀 Running locally

```bash
# 📦 Install
npm install

# 🔥 Dev server
npm run dev

# 🏗️ Build for production
npm run build

# ✅ Run tests
npm run test
```

You'll need a Supabase project with the edge functions deployed.
See [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md) for the full setup guide, schema, RLS policies, and API reference.

---

## 📖 Documentation

Full technical and product docs live in **[`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md)**:
methodology · architecture · every API and tool used · edge function contracts · database schema.

---

<div align="center">

---

**Made with 🧡 for weekends that don't suck.**

*If Wiqo helped your weekend, give it a ⭐*

***By Dikshita***

</div>
