import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, Film, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Movie = {
  title: string;
  year: string;
  genre: string;
  why: string;
  platform: string;
};

type Props = { city?: string };

const PLATFORM_COLOR: Record<string, string> = {
  "Netflix": "bg-red-600 text-white",
  "Prime Video": "bg-sky-600 text-white",
  "Disney+": "bg-indigo-700 text-white",
  "Hotstar": "bg-blue-700 text-white",
  "Apple TV+": "bg-foreground text-background",
  "JioCinema": "bg-pink-600 text-white",
  "Max": "bg-purple-700 text-white",
  "Hulu": "bg-emerald-600 text-white",
  "Theatres": "bg-amber-600 text-white",
};

const platformLink = (platform: string, title: string) => {
  const q = encodeURIComponent(title);
  switch (platform) {
    case "Netflix": return `https://www.netflix.com/search?q=${q}`;
    case "Prime Video": return `https://www.primevideo.com/search/?phrase=${q}`;
    case "Disney+": return `https://www.disneyplus.com/search?q=${q}`;
    case "Hotstar": return `https://www.hotstar.com/in/search?q=${q}`;
    case "Apple TV+": return `https://tv.apple.com/search?term=${q}`;
    case "JioCinema": return `https://www.jiocinema.com/search/${q}`;
    case "Max": return `https://play.max.com/search?q=${q}`;
    case "Hulu": return `https://www.hulu.com/search?q=${q}`;
    case "Theatres": return `https://www.google.com/search?q=${q}+movie+tickets+near+me`;
    default: return `https://www.justwatch.com/in/search?q=${q}`;
  }
};

export const TrendingMovies = ({ city }: Props) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("trending-movies", {
        body: { city },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMovies(data?.movies || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load trending movies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" /> Trending right now
        </h2>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && <p className="text-sm text-destructive italic mb-4">{error}</p>}

      {loading && movies.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Finding what's hot this week...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {movies.map((m, i) => (
            <motion.a
              key={`${m.title}-${i}`}
              href={platformLink(m.platform, m.title)}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group rounded-2xl bg-card border border-border p-5 shadow-card hover:shadow-soft hover:border-primary/40 transition-all flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${PLATFORM_COLOR[m.platform] || "bg-muted text-foreground"}`}>
                    {m.platform}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {m.genre} · {m.year}
                  </span>
                </div>
                <div className="font-display text-xl truncate">{m.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{m.why}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 mt-1" />
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
};
