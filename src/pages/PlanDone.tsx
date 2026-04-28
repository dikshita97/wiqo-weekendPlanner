import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/wiqo/Logo";
import { useAuth } from "@/contexts/AuthContext";

const PlanDone = () => {
  const { user } = useAuth();
  const name = (user?.user_metadata?.display_name as string) || "friend";

  useEffect(() => {
    sessionStorage.removeItem("wiqo:plan");
  }, []);

  return (
    <div className="min-h-screen bg-dusk grain text-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-glow opacity-40 pointer-events-none" />

      {/* Floating confetti emojis */}
      {["✨", "🌅", "🌸", "🍷", "🎶", "💛", "🍃"].map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none select-none"
          initial={{ y: "100vh", x: `${10 + i * 12}%`, opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 6 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
        >
          {e}
        </motion.div>
      ))}

      <header className="relative container mx-auto py-6">
        <Logo className="[&_span:last-child]:text-background" />
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-primary-glow mb-6">You're all set</p>
          <h1 className="font-display text-6xl sm:text-8xl leading-[0.95]">
            Have a great <br />
            <span className="italic text-gradient-sunset">weekend, {name}.</span>
          </h1>
          <p className="mt-8 text-lg text-background/70 max-w-lg mx-auto">
            Wiqo will be here when you're ready to plan the next one. Now go — be soft, be loud, be yours.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 rounded-full bg-sunset px-8 py-4 text-lg font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all"
            >
              Plan another weekend
            </Link>
            <Link to="/" className="text-sm text-background/60 hover:text-background underline-offset-4 hover:underline">
              Back home
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="relative container mx-auto py-8 text-center text-xs text-background/50">
        Wiqo · Plan your weekends the best way
      </footer>
    </div>
  );
};

export default PlanDone;
