import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, MapPin, Wand2 } from "lucide-react";
import { Logo } from "@/components/wiqo/Logo";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-warm grain overflow-hidden">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between py-6">
        <Logo />
        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#moods" className="hover:text-foreground transition-colors">Moods</a>
          {user ? (
            <Link to="/plan" className="rounded-full bg-foreground px-5 py-2 text-background hover:opacity-90 transition">
              Open app
            </Link>
          ) : (
            <Link to="/auth" className="rounded-full border border-foreground/20 px-5 py-2 hover:bg-foreground hover:text-background transition">
              Sign in
            </Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto pt-12 pb-24 sm:pt-20 sm:pb-32 relative">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/60 backdrop-blur px-4 py-1.5 text-sm text-muted-foreground mb-8"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Vibe-first weekend planning
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-tight"
          >
            Plan your weekends <br />
            <span className="italic text-gradient-sunset">the best way</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Pick your mood. Pick your dates. Wiqo crafts an instant, beautiful
            plan — with everything you need to actually go do it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to={user ? "/plan" : "/auth"}
              className="group inline-flex items-center gap-2 rounded-full bg-sunset px-8 py-4 text-lg font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all duration-500"
            >
              Start
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
              See how it works ↓
            </a>
          </motion.div>

          {/* Floating mood chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto"
          >
            {["🌿 Chill", "🧭 Explore", "🎉 Social", "🧠 Productive", "💖 Self-growth", "🍜 Foodie", "💤 Lazy"].map((m, i) => (
              <motion.span
                key={m}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                className="rounded-full bg-card border border-border px-4 py-2 text-sm shadow-card"
              >
                {m}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container mx-auto py-24">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">How it works</p>
          <h2 className="font-display text-4xl sm:text-6xl">
            Three steps. <span className="italic text-gradient-sunset">One weekend.</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: <MapPin />, n: "01", t: "Pick the dates", d: "From Friday night to Sunday wind-down — you choose the window." },
            { icon: <Sparkles />, n: "02", t: "Pick a mood", d: "Chill, explore, party, reset — Wiqo speaks your weekend language." },
            { icon: <Wand2 />, n: "03", t: "Get a plan", d: "Instant ideas, links, locations & AI-crafted suggestions ready to go." },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-3xl bg-card border border-border p-8 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-sunset flex items-center justify-center text-primary-foreground">
                  {s.icon}
                </div>
                <span className="font-display text-3xl text-muted-foreground/40">{s.n}</span>
              </div>
              <h3 className="font-display text-2xl mb-2">{s.t}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Moods preview */}
      <section id="moods" className="container mx-auto py-24">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Seven moods</p>
          <h2 className="font-display text-4xl sm:text-6xl">
            Whatever you're <span className="italic text-gradient-sunset">feeling.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { e: "🌿", n: "Chill", t: "Do less, feel better" },
            { e: "🧭", n: "Explore", t: "Go somewhere new" },
            { e: "🎉", n: "Social", t: "Make memories" },
            { e: "🧠", n: "Productive", t: "Reset in 48 hrs" },
            { e: "💖", n: "Self-growth", t: "Date yourself" },
            { e: "🍜", n: "Foodie", t: "Eat your way through" },
            { e: "💤", n: "Lazy", t: "No plans = best plans" },
          ].map((m, i) => (
            <motion.div
              key={m.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-3xl bg-card border border-border p-6 shadow-card hover:-translate-y-1 transition-transform"
            >
              <div className="text-4xl mb-3">{m.e}</div>
              <h3 className="font-display text-2xl">{m.n}</h3>
              <p className="text-sm text-muted-foreground italic mt-1">{m.t}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto py-32">
        <div className="relative rounded-[2rem] bg-dusk shadow-deep overflow-hidden p-12 sm:p-20 text-center">
          <div className="absolute inset-0 bg-glow opacity-50" />
          <div className="relative">
            <h2 className="font-display text-4xl sm:text-6xl text-background">
              Your weekend, <span className="italic text-gradient-sunset">already planned.</span>
            </h2>
            <Link
              to={user ? "/plan" : "/auth"}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 text-lg font-medium text-foreground shadow-soft hover:shadow-glow transition-all"
            >
              Start planning
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="container mx-auto py-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Wiqo · Plan your weekends the best way.
      </footer>
    </div>
  );
};

export default Landing;
