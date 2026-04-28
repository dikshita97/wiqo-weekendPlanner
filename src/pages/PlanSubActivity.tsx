import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { PlanShell } from "@/components/wiqo/PlanShell";
import { findMood } from "@/lib/moods";

const PlanSubActivity = () => {
  const { moodId } = useParams<{ moodId: string }>();
  const navigate = useNavigate();
  const mood = findMood(moodId || "");
  const [planCtx, setPlanCtx] = useState<{ from?: string; to?: string; city?: string; mood?: string }>({});

  useEffect(() => {
    const raw = sessionStorage.getItem("wiqo:plan");
    if (!raw || !mood) { navigate("/plan/mood"); return; }
    setPlanCtx(JSON.parse(raw));
  }, [mood, navigate]);

  if (!mood) return null;

  const handlePick = (subId: string) => {
    sessionStorage.setItem("wiqo:plan", JSON.stringify({ ...planCtx, sub: subId }));
    navigate(`/plan/mood/${moodId}/${subId}`);
  };

  return (
    <PlanShell step={3}>
      <div className="max-w-6xl mx-auto pt-8 sm:pt-12">
        <button
          onClick={() => navigate("/plan/mood")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> All moods
        </button>

        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Step 3 · {mood.shortName} mode
          </p>
          <div className="text-6xl mb-4">{mood.emoji}</div>
          <h1 className="font-display text-5xl sm:text-7xl leading-[1]">
            <span className="italic text-gradient-sunset">"{mood.tagline}"</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">{mood.description}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mood.subActivities.map((sub, i) => (
            <motion.button
              key={sub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              onClick={() => handlePick(sub.id)}
              className="group text-left rounded-3xl border border-border bg-card p-7 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-500 relative"
            >
              {sub.type === "ai" && (
                <div className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-sunset px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> AI
                </div>
              )}
              <div className="text-4xl mb-4">{sub.emoji}</div>
              <h2 className="font-display text-2xl mb-2">{sub.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{sub.description}</p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Let's go
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </PlanShell>
  );
};

export default PlanSubActivity;
