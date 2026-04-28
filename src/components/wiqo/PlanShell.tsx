import { ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/wiqo/Logo";
import { toast } from "sonner";

export const PlanShell = ({ children, step }: { children: ReactNode; step: 1 | 2 | 3 | 4 }) => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="font-display italic text-2xl text-muted-foreground">loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const handleSignOut = async () => {
    await signOut();
    toast.success("See you next weekend 👋");
  };

  return (
    <div className="min-h-screen bg-warm grain">
      <header className="container mx-auto flex items-center justify-between py-6">
        <Logo />
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div
                  className={`h-1.5 w-8 rounded-full transition-all ${
                    n <= step ? "bg-sunset" : "bg-muted"
                  }`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto pb-20"
      >
        {children}
      </motion.main>
    </div>
  );
};
