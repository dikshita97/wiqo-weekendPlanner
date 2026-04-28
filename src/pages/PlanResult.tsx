import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, MapPin, PartyPopper, Car, BookOpen, Music, Play, Search, Sparkles } from "lucide-react";
import { PlanShell } from "@/components/wiqo/PlanShell";
import { AIAgent } from "@/components/wiqo/AIAgent";
import { TrendingMovies } from "@/components/wiqo/TrendingMovies";
import { NearbyPlaces } from "@/components/wiqo/NearbyPlaces";
import { InstantOrder } from "@/components/wiqo/InstantOrder";
import { findMood, findSubActivity, AI_PROMPT_KEY, ActionLink } from "@/lib/moods";
import { getStoredLocation } from "@/lib/geolocation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const KIND_ICON: Record<ActionLink["kind"], JSX.Element> = {
  search: <Search className="h-4 w-4" />,
  book: <Car className="h-4 w-4" />,
  watch: <Play className="h-4 w-4" />,
  listen: <Music className="h-4 w-4" />,
  read: <BookOpen className="h-4 w-4" />,
  map: <MapPin className="h-4 w-4" />,
  ai: <Sparkles className="h-4 w-4" />,
};

const PlanResult = () => {
  const { moodId, subId } = useParams<{ moodId: string; subId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mood = findMood(moodId || "");
  const sub = findSubActivity(moodId || "", subId || "");
  const [planCtx, setPlanCtx] = useState<{ from?: string; to?: string; city?: string }>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("wiqo:plan");
    if (raw) setPlanCtx(JSON.parse(raw));
    if (!mood || !sub) navigate("/plan/mood");
  }, [mood, sub, navigate]);

  useEffect(() => {
    const persist = async () => {
      if (!user || !mood || !sub || saved || !planCtx.from || !planCtx.to) return;
      const { error } = await supabase.from("weekend_plans").insert({
        user_id: user.id,
        start_date: planCtx.from,
        end_date: planCtx.to,
        mood: mood.id,
        sub_activity: sub.id,
      });
      if (!error) setSaved(true);
    };
    persist();
  }, [user, mood, sub, saved, planCtx]);

  if (!mood || !sub) return null;

  const stored = getStoredLocation();
  const city = planCtx.city || stored?.city;
  const lat = stored?.lat;
  const lng = stored?.lng;

  const links =
    sub.buildLinks?.({
      city,
      lat,
      lng,
      dateRange:
        planCtx.from && planCtx.to
          ? `${format(parseISO(planCtx.from), "MMM d")} – ${format(parseISO(planCtx.to), "MMM d")}`
          : undefined,
    }) || [];

  const dateLabel =
    planCtx.from && planCtx.to
      ? `${format(parseISO(planCtx.from), "EEE, MMM d")} → ${format(parseISO(planCtx.to), "EEE, MMM d")}`
      : "this weekend";
  const aiKey = AI_PROMPT_KEY[sub.id];

  const handleFinish = () => {
    toast.success("Have a beautiful weekend ✨");
    navigate("/plan/done");
  };

  return (
    <PlanShell step={4}>
      <div className="max-w-5xl mx-auto pt-8 sm:pt-12">
        <button
          onClick={() => navigate(`/plan/mood/${moodId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Pick something else
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
            {mood.shortName} · {dateLabel}
          </p>
          <div className="text-5xl mb-3">{sub.emoji}</div>
          <h1 className="font-display text-5xl sm:text-7xl leading-[1]">
            <span className="italic text-gradient-sunset">{sub.title}</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">{sub.description}</p>
        </motion.div>

        {/* AI-driven (now two-way chat) */}
        {aiKey && (
          <div className="mb-10">
            <AIAgent activity={aiKey} dateRange={dateLabel} city={city} />
          </div>
        )}

        {/* Real-time trending movies */}
        {sub.trendingMovies && (
          <div className="mb-10">
            <TrendingMovies city={city} />
          </div>
        )}

        {/* Curated content */}
        {sub.curated && sub.curated.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl mb-4">Hand-picked for you</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {sub.curated.map((c, i) => (
                <motion.a
                  key={c.title}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl bg-card border border-border p-5 shadow-card hover:shadow-soft transition-all flex items-start justify-between gap-3"
                >
                  <div>
                    {c.tag && (
                      <span className="inline-block text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full mb-2">
                        {c.tag}
                      </span>
                    )}
                    <div className="font-display text-xl">{c.title}</div>
                    {c.subtitle && <div className="text-sm text-muted-foreground mt-0.5">{c.subtitle}</div>}
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 mt-1" />
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Action links */}
        {links.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl mb-4">Make it real</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {links.map((link, i) => (
                <motion.a
                  key={link.label + i}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group rounded-2xl bg-card border border-border px-5 py-4 shadow-card hover:shadow-soft hover:border-primary/40 transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl bg-sunset/10 text-primary flex items-center justify-center">
                      {KIND_ICON[link.kind]}
                    </span>
                    <span className="font-medium">{link.label}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Instant order strip (game nights) */}
        {sub.instantOrder && (
          <div className="mb-10">
            <InstantOrder />
          </div>
        )}

        {/* Real nearby places — pick one, get ride links */}
        {sub.nearby && (
          <div className="mb-10">
            <NearbyPlaces
              kind={sub.nearby.kinds}
              title={sub.nearby.title}
              lat={lat}
              lng={lng}
              city={city}
            />
          </div>
        )}

        {/* Finish */}
        <div className="rounded-3xl bg-card border border-border p-8 shadow-card text-center">
          <p className="text-muted-foreground mb-4">All set with your weekend?</p>
          <button
            onClick={handleFinish}
            className="inline-flex items-center gap-2 rounded-full bg-sunset px-8 py-4 text-lg font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all"
          >
            <PartyPopper className="h-5 w-5" /> Lock it in
          </button>
        </div>
      </div>
    </PlanShell>
  );
};

export default PlanResult;
