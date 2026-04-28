import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PlanShell } from "@/components/wiqo/PlanShell";
import { MOODS } from "@/lib/moods";

const PlanMood = () => {
  const navigate = useNavigate();
  const [planCtx, setPlanCtx] = useState<{ from?: string; to?: string; city?: string }>({});

  useEffect(() => {
    const raw = sessionStorage.getItem("wiqo:plan");
    if (!raw) {
      navigate("/plan");
      return;
    }
    setPlanCtx(JSON.parse(raw));
  }, [navigate]);

  const handlePick = (id: string) => {
    sessionStorage.setItem("wiqo:plan", JSON.stringify({ ...planCtx, mood: id }));
    navigate(`/plan/mood/${id}`);
  };

  return (
    <PlanShell step={2}>
      <div className="max-w-6xl mx-auto pt-8 sm:pt-12">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Step 2 · Your mood</p>
          <h1 className="font-display text-5xl sm:text-7xl leading-[1]">
            What's the <span className="italic text-gradient-sunset">vibe</span>?
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">Pick one. Trust it.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOODS.map((mood, i) => (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              onClick={() => handlePick(mood.id)}
              className="group text-left rounded-3xl border border-border bg-card p-7 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
            >
              <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${mood.gradient} opacity-50 blur-2xl group-hover:opacity-80 transition-opacity`} />
              <div className="relative">
                <div className="text-5xl mb-4">{mood.emoji}</div>
                <h2 className="font-display text-3xl mb-1">{mood.shortName}</h2>
                <p className="font-display italic text-lg text-gradient-sunset mb-3">"{mood.tagline}"</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{mood.description}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                  Choose
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </PlanShell>
  );
};

export default PlanMood;
