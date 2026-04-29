import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const KIND_FILTERS: Record<string, string> = {
  cinema: "amenity=cinema",
  theatre: "amenity=theatre",
  library: "amenity=library",
  stationery: "shop=stationery",
  spa: "leisure=spa|shop=massage|amenity=spa",
  nightclub: "amenity=nightclub",
  bar: "amenity=bar|amenity=pub",
  gym: "leisure=fitness_centre|leisure=sports_centre",
  yoga: "sport=yoga|leisure=fitness_centre",
  cafe: "amenity=cafe",
  restaurant: "amenity=restaurant",
  bakery: "shop=bakery",
  fast_food: "amenity=fast_food",
  park: "leisure=park",
  nature: "natural=water|leisure=nature_reserve",
  attraction: "tourism=attraction",
  museum: "tourism=museum",
  shopping: "shop",
};

const KIND_SEARCH_TERMS: Record<string, string> = {
  cinema: "cinema",
  theatre: "theatre",
  library: "library",
  stationery: "stationery shop",
  spa: "spa massage",
  nightclub: "nightclub",
  bar: "bar pub",
  gym: "gym fitness centre",
  yoga: "yoga studio",
  cafe: "cafe",
  restaurant: "restaurant",
  bakery: "bakery dessert",
  fast_food: "fast food street food",
  park: "park",
  nature: "lake garden nature",
  attraction: "tourist attraction",
  museum: "museum",
  shopping: "shopping mall market",
};

const buildQuery = (kinds: string[], lat: number, lng: number, radiusM = 5000) => {
  const parts: string[] = [];
  for (const k of kinds) {
    const filter = KIND_FILTERS[k];
    if (!filter) continue;
    for (const f of filter.split("|")) {
      const [key, val] = f.split("=");
      const tag = val ? `["${key}"="${val}"]` : `["${key}"]`;
      parts.push(`node${tag}(around:${radiusM},${lat},${lng});`);
      parts.push(`way${tag}(around:${radiusM},${lat},${lng});`);
    }
  }
  return `[out:json][timeout:8];(${parts.join("")});out tags center 25;`;
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

async function fetchOverpass(query: string): Promise<any> {
  let lastErr: string = "";
  for (const url of ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
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

async function fetchNominatim(kinds: string[], lat: number, lng: number, radiusM = 5000): Promise<any[]> {
  const delta = Math.max(0.01, radiusM / 111000);
  const viewbox = `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`;
  const results: any[] = [];
  const seen = new Set<string>();

  for (const kind of kinds.slice(0, 3)) {
    const q = KIND_SEARCH_TERMS[kind] || kind;
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "10");
    url.searchParams.set("bounded", "1");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("viewbox", viewbox);
    url.searchParams.set("q", q);
    let data: any[] = [];
    try {
      const r = await fetch(url, { headers: { "User-Agent": "WiqoWeekendPlanner/1.0" } });
      if (!r.ok) continue;
      data = await r.json();
    } catch (e) {
      console.error("Nominatim fallback failed:", e);
      continue;
    }
    for (const p of data || []) {
      if (!p?.name || !p?.lat || !p?.lon) continue;
      const key = `${p.name}-${Number(p.lat).toFixed(3)}-${Number(p.lon).toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        id: `nominatim-${p.place_id}`,
        name: p.name,
        lat: Number(p.lat),
        lng: Number(p.lon),
        distanceKm: haversineKm(lat, lng, Number(p.lat), Number(p.lon)),
        address: p.display_name?.split(",").slice(1, 4).map((s: string) => s.trim()).filter(Boolean).join(", "),
        category: p.type || kind,
      });
    }
  }

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { kinds, kind, subcategory, lat, lng, radiusM } = await req.json();
    const requestedKinds = (Array.isArray(kinds) ? kinds : [subcategory || kind]).filter(
      (k: unknown): k is string => typeof k === "string" && k in KIND_FILTERS,
    );
    if (requestedKinds.length === 0 || typeof lat !== "number" || typeof lng !== "number") {
      return new Response(
        JSON.stringify({ error: "INVALID_INPUT", places: [], fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const queryRadius = Math.min(Number(radiusM) || 2000, 5000);
    const query = buildQuery(requestedKinds, lat, lng, queryRadius);

    let data: any;
    try {
      data = await fetchOverpass(query);
    } catch (e) {
      console.error("Overpass failed:", e);
      const fallbackPlaces = await fetchNominatim(requestedKinds, lat, lng, queryRadius);
      if (fallbackPlaces.length > 0) {
        fallbackPlaces.sort((a, b) => a.distanceKm - b.distanceKm);
        return new Response(
          JSON.stringify({ places: fallbackPlaces.slice(0, 12), source: "nominatim" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          error: "SERVICE_UNAVAILABLE",
          message: e instanceof Error ? e.message : "Map service unavailable",
          places: [],
          fallback: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const els = (data.elements || []) as Array<any>;
    const out: any[] = [];
    const seen = new Set<string>();
    for (const e of els) {
      const plat = e.lat ?? e.center?.lat;
      const plng = e.lon ?? e.center?.lon;
      const name = e.tags?.name;
      if (!plat || !plng || !name) continue;
      const key = name + plat.toFixed(3);
      if (seen.has(key)) continue;
      seen.add(key);
      const address = e.tags?.["addr:street"]
        ? [e.tags["addr:housenumber"], e.tags["addr:street"], e.tags["addr:suburb"] || e.tags["addr:city"]]
            .filter(Boolean).join(", ")
        : undefined;
      out.push({
        id: `${e.type}-${e.id}`,
        name,
        lat: plat,
        lng: plng,
        distanceKm: haversineKm(lat, lng, plat, plng),
        address,
      });
    }
    out.sort((a, b) => a.distanceKm - b.distanceKm);

    if (out.length === 0) {
      const fallbackPlaces = await fetchNominatim(requestedKinds, lat, lng, queryRadius);
      fallbackPlaces.sort((a, b) => a.distanceKm - b.distanceKm);
      if (fallbackPlaces.length > 0) {
        return new Response(
          JSON.stringify({ places: fallbackPlaces.slice(0, 12), source: "nominatim" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(
      JSON.stringify({ places: out.slice(0, 12), source: "overpass" }),
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
