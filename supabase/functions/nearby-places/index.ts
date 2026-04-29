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
  return `[out:json][timeout:8];(${parts.join("")});out center tags 25;`;
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
  "https://overpass.openstreetmap.ru/api/interpreter",
];

async function fetchOverpass(query: string): Promise<any> {
  let lastErr: string = "";
  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
      });
      if (!r.ok) {
        lastErr = `${url} -> ${r.status}`;
        continue;
      }
      return await r.json();
    } catch (e) {
      lastErr = `${url} -> ${e instanceof Error ? e.message : "error"}`;
    }
  }
  throw new Error(lastErr || "All Overpass endpoints failed");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { kinds, lat, lng, radiusM } = await req.json();
    if (!Array.isArray(kinds) || typeof lat !== "number" || typeof lng !== "number") {
      return new Response(
        JSON.stringify({ error: "INVALID_INPUT", places: [], fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const query = buildQuery(kinds, lat, lng, radiusM || 5000);

    let data: any;
    try {
      data = await fetchOverpass(query);
    } catch (e) {
      console.error("Overpass failed:", e);
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

    return new Response(
      JSON.stringify({ places: out.slice(0, 12) }),
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
