import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

type QueryPart = {
  selector: string;
  radius?: number;
  wayOnly?: boolean;
  nodeOnly?: boolean;
  relationOnly?: boolean;
};

const DEFAULT_RADIUS = 5000;

const KIND_PARTS: Record<string, QueryPart[]> = {
  cinema: [{ selector: '["amenity"="cinema"]' }],
  theatre: [{ selector: '["amenity"="theatre"]' }],
  library: [{ selector: '["amenity"="library"]' }],
  stationery: [{ selector: '["shop"="stationery"]' }],
  spa: [
    { selector: '["leisure"="spa"]' },
    { selector: '["amenity"="spa"]' },
    { selector: '["shop"="massage"]' },
    { selector: '["leisure"="wellness"]' },
    { selector: '["shop"="beauty"]' },
  ],
  nightclub: [
    { selector: '["amenity"="nightclub"]' },
    { selector: '["club"]' },
    { selector: '["amenity"="bar"]' },
    { selector: '["amenity"="pub"]' },
  ],
  club: [
    { selector: '["amenity"="nightclub"]' },
    { selector: '["club"]' },
  ],
  bar: [{ selector: '["amenity"="bar"]' }, { selector: '["amenity"="pub"]' }],
  gym: [{ selector: '["leisure"="fitness_centre"]' }, { selector: '["leisure"="sports_centre"]' }],
  yoga: [{ selector: '["sport"="yoga"]' }, { selector: '["leisure"="fitness_centre"]' }, { selector: '["amenity"="yoga"]' }],
  cafe: [{ selector: '["amenity"="cafe"]' }],
  restaurant: [{ selector: '["amenity"="restaurant"]' }],
  bakery: [{ selector: '["shop"="bakery"]' }],
  fast_food: [{ selector: '["amenity"="fast_food"]' }, { selector: '["amenity"="food_court"]' }],
  street_food: [
    { selector: '["amenity"="fast_food"]', radius: 4000 },
    { selector: '["amenity"="food_court"]' },
    { selector: '["amenity"="marketplace"]' },
    { selector: '["shop"="kiosk"]' },
    { selector: '["cuisine"~"street_food|chaat|kebab|roll|momo|dosa|vada|pav|snack", i]' },
  ],
  park: [{ selector: '["leisure"="park"]' }],
  nature: [{ selector: '["natural"="water"]' }, { selector: '["leisure"="nature_reserve"]' }, { selector: '["natural"="wood"]' }],
  trail: [
    { selector: '["route"="hiking"]', radius: 35000, wayOnly: true },
    { selector: '["route"="hiking"]', radius: 35000, relationOnly: true },
    { selector: '["natural"~"peak|ridge|saddle|cliff"]', radius: 40000, nodeOnly: true },
    { selector: '["tourism"="viewpoint"]', radius: 30000, nodeOnly: true },
    { selector: '["highway"~"path|track"]["name"]', radius: 18000, wayOnly: true },
  ],
  attraction: [{ selector: '["tourism"="attraction"]' }],
  museum: [{ selector: '["tourism"="museum"]' }],
  shopping: [{ selector: '["shop"]' }, { selector: '["amenity"="marketplace"]' }],
};

const KIND_SEARCH_TERMS: Record<string, string[]> = {
  cinema: ["cinema", "movie theatre"],
  theatre: ["theatre", "performing arts"],
  library: ["library"],
  stationery: ["stationery shop"],
  spa: ["spa", "massage spa", "wellness centre", "beauty salon"],
  nightclub: ["nightclub", "club", "dance club"],
  club: ["nightclub", "club"],
  bar: ["bar", "pub"],
  gym: ["gym", "fitness centre"],
  yoga: ["yoga studio", "yoga class"],
  cafe: ["cafe", "specialty coffee"],
  restaurant: ["restaurant"],
  bakery: ["bakery", "dessert"],
  fast_food: ["fast food", "food court"],
  street_food: ["street food", "chaat", "food truck", "food market"],
  park: ["park"],
  nature: ["lake", "garden", "nature reserve"],
  trail: ["hiking trail", "trekking trail", "viewpoint", "hill trail"],
  attraction: ["tourist attraction"],
  museum: ["museum"],
  shopping: ["shopping mall", "market"],
};

const buildQuery = (kinds: string[], lat: number, lng: number, radiusM = DEFAULT_RADIUS) => {
  const parts: string[] = [];
  for (const k of kinds) {
    const definitions = KIND_PARTS[k];
    if (!definitions) continue;
    for (const def of definitions) {
      const radius = Math.min(def.radius || radiusM, def.radius ? 45000 : 7000);
      if (!def.wayOnly && !def.relationOnly) parts.push(`node${def.selector}(around:${radius},${lat},${lng});`);
      if (!def.nodeOnly && !def.relationOnly) parts.push(`way${def.selector}(around:${radius},${lat},${lng});`);
      if (!def.nodeOnly && !def.wayOnly) parts.push(`relation${def.selector}(around:${radius},${lat},${lng});`);
    }
  }
  return `[out:json][timeout:14];(${parts.join("")});out tags center 40;`;
};

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

const CHAIN_BLOCKLIST = /\b(mcdonald'?s|kfc|subway|domino'?s|burger king|pizza hut|starbucks)\b/i;

async function fetchOverpass(query: string): Promise<any> {
  let lastErr = "";
  for (const url of ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 16000);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "WiqoWeekendPlanner/1.0",
        },
        body: "data=" + encodeURIComponent(query),
        signal: controller.signal,
      });
      if (!r.ok) {
        lastErr = `${url} -> ${r.status}`;
        continue;
      }
      return await r.json();
    } catch (e) {
      lastErr = `${url} -> ${e instanceof Error ? e.message : "error"}`;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(lastErr || "All Overpass endpoints failed");
}

async function fetchNominatim(kinds: string[], lat: number, lng: number, radiusM = DEFAULT_RADIUS): Promise<any[]> {
  const usesTrail = kinds.includes("trail");
  const delta = Math.max(0.01, (usesTrail ? Math.max(radiusM, 35000) : radiusM) / 111000);
  const viewbox = `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`;
  const results: any[] = [];
  const seen = new Set<string>();

  const terms = kinds.flatMap((kind) => KIND_SEARCH_TERMS[kind] || [kind]).slice(0, 8);
  for (const q of terms) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "8");
    url.searchParams.set("bounded", "1");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("viewbox", viewbox);
    url.searchParams.set("q", q);
    try {
      const r = await fetch(url, { headers: { "User-Agent": "WiqoWeekendPlanner/1.0" } });
      if (!r.ok) continue;
      const data = await r.json();
      for (const p of data || []) {
        if (!p?.name || !p?.lat || !p?.lon) continue;
        const placeLat = Number(p.lat);
        const placeLng = Number(p.lon);
        const key = `${p.name}-${placeLat.toFixed(3)}-${placeLng.toFixed(3)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({
          id: `nominatim-${p.place_id}`,
          name: p.name,
          lat: placeLat,
          lng: placeLng,
          distanceKm: haversineKm(lat, lng, placeLat, placeLng),
          address: p.display_name?.split(",").slice(1, 4).map((s: string) => s.trim()).filter(Boolean).join(", "),
          category: p.type || q,
        });
      }
    } catch (e) {
      console.error("Nominatim fallback failed:", e);
    }
  }

  return results;
}

function normalizeElement(e: any, lat: number, lng: number) {
  const plat = e.lat ?? e.center?.lat;
  const plng = e.lon ?? e.center?.lon;
  const name = e.tags?.name;
  if (!plat || !plng || !name) return null;
  const address = e.tags?.["addr:street"]
    ? [e.tags["addr:housenumber"], e.tags["addr:street"], e.tags["addr:suburb"] || e.tags["addr:city"]].filter(Boolean).join(", ")
    : e.tags?.natural || e.tags?.tourism || e.tags?.route || e.tags?.amenity || e.tags?.leisure || e.tags?.shop;
  return {
    id: `${e.type}-${e.id}`,
    name,
    lat: plat,
    lng: plng,
    distanceKm: haversineKm(lat, lng, plat, plng),
    address,
    category: e.tags?.natural || e.tags?.tourism || e.tags?.route || e.tags?.amenity || e.tags?.shop || e.tags?.leisure,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { kinds, kind, subcategory, lat, lng, radiusM } = await req.json();
    const requestedKinds = (Array.isArray(kinds) ? kinds : [subcategory || kind]).filter(
      (k: unknown): k is string => typeof k === "string" && k in KIND_PARTS,
    );
    if (requestedKinds.length === 0 || typeof lat !== "number" || typeof lng !== "number") {
      return new Response(JSON.stringify({ error: "INVALID_INPUT", places: [], fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const usesTrail = requestedKinds.includes("trail");
    const queryRadius = usesTrail ? Math.max(Number(radiusM) || 0, 30000) : Math.min(Number(radiusM) || DEFAULT_RADIUS, 7000);
    const query = buildQuery(requestedKinds, lat, lng, queryRadius);

    let out: any[] = [];
    try {
      const data = await fetchOverpass(query);
      const seen = new Set<string>();
      for (const e of (data.elements || []) as Array<any>) {
        const place = normalizeElement(e, lat, lng);
        if (!place) continue;
        const key = `${place.name}-${place.lat.toFixed(3)}-${place.lng.toFixed(3)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(place);
      }
    } catch (e) {
      console.error("Overpass failed:", e);
    }

    if (out.length < 4) {
      const fallbackPlaces = await fetchNominatim(requestedKinds, lat, lng, queryRadius);
      const seen = new Set(out.map((p) => `${p.name}-${p.lat.toFixed(3)}-${p.lng.toFixed(3)}`));
      for (const place of fallbackPlaces) {
        const key = `${place.name}-${place.lat.toFixed(3)}-${place.lng.toFixed(3)}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push(place);
        }
      }
    }

    out = out
      .filter((place) => !(requestedKinds.includes("street_food") && CHAIN_BLOCKLIST.test(place.name)))
      .filter((place) => Number.isFinite(place.distanceKm))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12);

    return new Response(
      JSON.stringify({
        places: out,
        source: out.length > 0 ? "open-map" : "empty",
        fallback: out.length === 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("nearby-places error:", e);
    return new Response(
      JSON.stringify({
        error: "INTERNAL",
        message: e instanceof Error ? e.message : "Unknown error",
        places: [],
        fallback: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
