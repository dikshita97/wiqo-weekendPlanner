import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/wiqo/Logo";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters.").max(72);

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery token from the URL hash and emits an event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Also accept if a session already exists (user just clicked email link).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pwd = passwordSchema.parse(password);
      if (pwd !== confirm) throw new Error("Passwords don't match.");
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      toast.success("Password updated ✨");
      navigate("/plan");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm grain flex flex-col">
      <header className="container mx-auto py-6"><Logo /></header>
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-5xl sm:text-6xl">
              Set a <span className="italic text-gradient-sunset">new password.</span>
            </h1>
            <p className="mt-3 text-muted-foreground">Make it one your weekend self can remember.</p>
          </div>

          <div className="rounded-3xl bg-card border border-border shadow-card p-6 sm:p-8">
            {!ready ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Open this page from the password reset link in your email.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">New password</label>
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
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
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
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update password"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResetPassword;
