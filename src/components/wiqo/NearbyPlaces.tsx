import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, Star, Car, Navigation, Bike, ChevronRight, RefreshCw } from "lucide-react";

export type NearbyKind =
  | "cinema"
  | "library"
  | "stationery"
  | "spa"
  | "nightclub"
  | "bar"
  | "gym"
  | "yoga"
  | "cafe"
  | "restaurant"
  | "park";

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  address?: string;
  category?: string;
};

type Props = {
  kind: NearbyKind | NearbyKind[];
  title: string;
  lat?: number;
  lng?: number;
  city?: string;
};

// Overpass query builders per kind
const KIND_FILTERS: Record<NearbyKind, string> = {
  cinema: 'amenity=cinema',
  library: 'amenity=library',
  stationery: 'shop=stationery',
  spa: 'leisure=spa|shop=massage|amenity=spa',
  nightclub: 'amenity=nightclub',
  bar: 'amenity=bar|amenity=pub',
  gym: 'leisure=fitness_centre|leisure=sports_centre',
  yoga: 'sport=yoga|leisure=fitness_centre',
  cafe: 'amenity=cafe',
  restaurant: 'amenity=restaurant',
  park: 'leisure=park',
};

const buildOverpassQuery = (kinds: NearbyKind[], lat: number, lng: number, radiusM = 4000) => {
  const parts: string[] = [];
  for (const k of kinds) {
    const filter = KIND_FILTERS[k];
    for (const f of filter.split("|")) {
      const [key, val] = f.split("=");
      parts.push(`node["${key}"="${val}"](around:${radiusM},${lat},${lng});`);
      parts.push(`way["${key}"="${val}"](around:${radiusM},${lat},${lng});`);
    }
  }
  return `[out:json][timeout:20];(${parts.join("")});out center 30;`;
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

const ride = {
  uber: (lat: number, lng: number, name: string) =>
    `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodeURIComponent(name)}`,
  ola: (lat: number, lng: number) =>
    `https://book.olacabs.com/?drop_lat=${lat}&drop_lng=${lng}`,
  rapido: () => `https://rapido.bike/`,
  maps: (lat: number, lng: number, name: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`,
};

export const NearbyPlaces = ({ kind, title, lat, lng, city }: Props) => {
  const kinds = useMemo(() => (Array.isArray(kind) ? kind : [kind]), [kind]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);

  const load = async () => {
    if (!lat || !lng) {
      setError("Turn on location on the date step to see real spots near you.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = buildOverpassQuery(kinds, lat, lng, 5000);
      const r = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: q,
      });
      if (!r.ok) throw new Error("Couldn't reach the map service.");
      const data = await r.json();
      const els = (data.elements || []) as Array<{
        id: number; type: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string>;
      }>;
      const out: Place[] = [];
      const seen = new Set<string>();
      for (const e of els) {
        const plat = e.lat ?? e.center?.lat;
        const plng = e.lon ?? e.center?.lon;
        const name = e.tags?.name;
        if (!plat || !plng || !name) continue;
        const key = name + plat.toFixed(3);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          id: `${e.type}-${e.id}`,
          name,
          lat: plat,
          lng: plng,
          distanceKm: haversineKm(lat, lng, plat, plng),
          address:
            e.tags?.["addr:street"]
              ? [e.tags["addr:housenumber"], e.tags["addr:street"], e.tags["addr:suburb"] || e.tags["addr:city"]]
                  .filter(Boolean)
                  .join(", ")
              : undefined,
        });
      }
      out.sort((a, b) => a.distanceKm - b.distanceKm);
      setPlaces(out.slice(0, 10));
      if (out.length === 0) setError("Nothing came back nearby. Try a different category or zoom out.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, JSON.stringify(kinds)]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> {title}
        </h2>
        <button
          onClick={load}
          disabled={loading || !lat}
          className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {!lat && (
        <p className="text-sm text-muted-foreground italic mb-4">
          Share your location to see real places near you{city ? ` in ${city}` : ""}.
        </p>
      )}

      {error && <p className="text-sm text-destructive italic mb-4">{error}</p>}

      {loading && places.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching nearby...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {places.map((p, i) => {
            const isSel = selected?.id === p.id;
            return (
              <motion.button
                key={p.id}
                onClick={() => setSelected(isSel ? null : p)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  isSel
                    ? "bg-sunset/10 border-primary shadow-soft"
                    : "bg-card border-border shadow-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg truncate">{p.name}</div>
                    {p.address && <div className="text-xs text-muted-foreground mt-0.5 truncate">{p.address}</div>}
                    <div className="text-xs text-muted-foreground mt-1.5 inline-flex items-center gap-1">
                      <Star className="h-3 w-3" /> {p.distanceKm.toFixed(1)} km away
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 mt-1 shrink-0 transition-transform ${isSel ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl bg-dusk text-background p-5 shadow-deep"
          >
            <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Get to</p>
            <p className="font-display text-xl mb-4">{selected.name}</p>
            <div className="flex flex-wrap gap-2">
              <a href={ride.uber(selected.lat, selected.lng, selected.name)} target="_blank" rel="noreferrer" className="rounded-full bg-background text-foreground px-4 py-2 text-sm inline-flex items-center gap-2 hover:opacity-90">
                <Car className="h-4 w-4" /> Uber
              </a>
              <a href={ride.ola(selected.lat, selected.lng)} target="_blank" rel="noreferrer" className="rounded-full bg-background/10 border border-background/20 text-background px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-background/20">
                <Car className="h-4 w-4" /> Ola
              </a>
              <a href={ride.rapido()} target="_blank" rel="noreferrer" className="rounded-full bg-background/10 border border-background/20 text-background px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-background/20">
                <Bike className="h-4 w-4" /> Rapido
              </a>
              <a href={ride.maps(selected.lat, selected.lng, selected.name)} target="_blank" rel="noreferrer" className="rounded-full bg-primary-glow text-dusk px-4 py-2 text-sm inline-flex items-center gap-2 hover:opacity-90">
                <Navigation className="h-4 w-4" /> Maps directions
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
