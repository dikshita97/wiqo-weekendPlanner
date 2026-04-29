import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, Star, Car, Navigation, Bike, ChevronRight, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type NearbyKind =
  | "cinema"
  | "theatre"
  | "library"
  | "stationery"
  | "spa"
  | "nightclub"
  | "bar"
  | "gym"
  | "yoga"
  | "cafe"
  | "restaurant"
  | "bakery"
  | "fast_food"
  | "street_food"
  | "nature"
  | "trail"
  | "attraction"
  | "museum"
  | "shopping"
  | "club"
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

const ride = {
  uber: (lat: number, lng: number, name: string) =>
    `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodeURIComponent(name)}`,
  ola: (lat: number, lng: number, name: string) =>
    `https://book.olacabs.com/?drop_lat=${lat}&drop_lng=${lng}&drop_name=${encodeURIComponent(name)}`,
  rapido: (lat: number, lng: number, name: string) =>
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`,
  maps: (lat: number, lng: number, name: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`,
};

export const NearbyPlaces = ({ kind, title, lat, lng, city }: Props) => {
  const kinds = useMemo(() => (Array.isArray(kind) ? kind : [kind]), [kind]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const mapPoints = useMemo(() => {
    if (places.length === 0) return [];
    const lats = places.map((p) => p.lat);
    const lngs = places.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = Math.max(maxLat - minLat, 0.01);
    const lngSpan = Math.max(maxLng - minLng, 0.01);
    return places.map((p) => ({
      ...p,
      x: Math.min(92, Math.max(8, ((p.lng - minLng) / lngSpan) * 84 + 8)),
      y: Math.min(92, Math.max(8, 92 - ((p.lat - minLat) / latSpan) * 84)),
    }));
  }, [places]);

  const load = async () => {
    if (!lat || !lng) {
      setError("Turn on location on the date step to see real spots near you.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("nearby-places", {
        body: { kinds, lat, lng, radiusM: 5000 },
      });
      if (fnErr) throw new Error(fnErr.message || "Couldn't reach the map service.");
      const found = ((data?.places || []) as Place[]).filter((place) => place.name && place.lat && place.lng);
      setPlaces(found);
      if (data?.fallback && found.length === 0) {
        setError("Nothing came back nearby. Try a different category or refresh in a moment.");
      } else if (found.length === 0) {
        setError("Nothing came back nearby. Try a different category or widen your search.");
      }
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
        <>
          {mapPoints.length > 0 && (
            <div className="relative h-64 overflow-hidden rounded-2xl border border-border bg-muted mb-4 shadow-card">
              <div className="absolute inset-0 opacity-60 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs text-muted-foreground border border-border">
                Tap a marker to select a place
              </div>
              {mapPoints.map((p, i) => {
                const isSel = selected?.id === p.id;
                return (
                  <button
                    key={`map-${p.id}`}
                    onClick={() => setSelected(p)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${isSel ? "z-20 scale-110" : "z-10 hover:scale-105"}`}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    aria-label={`Select ${p.name}`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full shadow-soft ${isSel ? "bg-sunset text-primary-foreground" : "bg-card text-primary border border-border"}`}>
                      {i + 1}
                    </span>
                    {isSel && (
                      <span className="absolute left-1/2 top-10 w-40 -translate-x-1/2 rounded-xl bg-card border border-border px-3 py-2 text-xs text-foreground shadow-card">
                        {p.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

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
        </>
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
              <a href={ride.ola(selected.lat, selected.lng, selected.name)} target="_blank" rel="noreferrer" className="rounded-full bg-background/10 border border-background/20 text-background px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-background/20">
                <Car className="h-4 w-4" /> Ola
              </a>
              <a href={ride.rapido(selected.lat, selected.lng, selected.name)} target="_blank" rel="noreferrer" className="rounded-full bg-background/10 border border-background/20 text-background px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-background/20">
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
