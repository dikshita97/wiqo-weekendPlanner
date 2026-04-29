import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import PlanStart from "./pages/PlanStart";
import PlanMood from "./pages/PlanMood";
import PlanSubActivity from "./pages/PlanSubActivity";
import PlanResult from "./pages/PlanResult";
import PlanDone from "./pages/PlanDone";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/plan" element={<PlanStart />} />
            <Route path="/plan/mood" element={<PlanMood />} />
            <Route path="/plan/mood/:moodId" element={<PlanSubActivity />} />
            <Route path="/plan/mood/:moodId/:subId" element={<PlanResult />} />
            <Route path="/plan/done" element={<PlanDone />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
