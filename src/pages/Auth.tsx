import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/wiqo/Logo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const emailSchema = z.string().trim().email({ message: "Enter a valid email address." }).max(255);
const phoneSchema = z.string().trim().regex(/^\+?[0-9\s\-()]{7,20}$/, { message: "Enter a valid phone number." });
const passwordSchema = z.string().min(6, "Password must be at least 6 characters.").max(72);

type Mode = "signin" | "signup";
type IdType = "email" | "phone";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [idType, setIdType] = useState<IdType>("email");
  const [identifier, setIdentifier] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For phone-as-username we synthesize a stable email so it fits Supabase email auth
      // (full SMS auth requires Twilio — V1 ships email/password + phone-as-username).
      let email: string;
      const phone = idType === "phone" ? phoneSchema.parse(identifier) : undefined;
      if (idType === "email") {
        email = emailSchema.parse(identifier);
      } else {
        email = `${phone!.replace(/[^0-9]/g, "")}@phone.wiqo.app`;
      }
      const pwd = passwordSchema.parse(password);

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pwd,
          options: {
            emailRedirectTo: `${window.location.origin}/plan`,
            data: {
              display_name: displayName || (idType === "email" ? email.split("@")[0] : "Friend"),
              phone: phone,
            },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Wiqo ✨");
        navigate("/plan");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
        toast.success("Welcome back 🌅");
        navigate("/plan");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm grain flex flex-col">
      <header className="container mx-auto py-6">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-5xl sm:text-6xl">
              {mode === "signup" ? (
                <>Make it <span className="italic text-gradient-sunset">official.</span></>
              ) : (
                <>Welcome <span className="italic text-gradient-sunset">back.</span></>
              )}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {mode === "signup" ? "Your weekend self will thank you." : "Let's plan something good."}
            </p>
          </div>

          <div className="rounded-3xl bg-card border border-border shadow-card p-6 sm:p-8">
            {/* Identifier toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-muted mb-6 text-sm">
              {(["email", "phone"] as IdType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setIdType(t); setIdentifier(""); }}
                  className={`py-2 rounded-full transition-all capitalize ${
                    idType === t ? "bg-card shadow-card text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Your name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Maya"
                    maxLength={60}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
              )}

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {idType === "email" ? "Email" : "Phone number"}
                </label>
                <input
                  type={idType === "email" ? "email" : "tel"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={idType === "email" ? "you@weekend.club" : "+91 98765 43210"}
                  required
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-sunset py-4 font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Already weekend-ready?" : "New to Wiqo?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                {mode === "signup" ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back home</Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
