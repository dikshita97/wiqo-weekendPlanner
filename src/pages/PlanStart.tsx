import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Loader2, Calendar as CalIcon } from "lucide-react";
import { PlanShell } from "@/components/wiqo/PlanShell";
import { getStoredLocation, requestLocation } from "@/lib/geolocation";
import { toast } from "sonner";

const getNextWeekend = () => {
  const today = startOfDay(new Date());
  const dow = today.getDay(); // 0 Sun
  const daysToFri = (5 - dow + 7) % 7 || 7;
  const fri = addDays(today, daysToFri);
  const sun = addDays(fri, 2);
  return { from: format(fri, "yyyy-MM-dd"), to: format(sun, "yyyy-MM-dd") };
};

const PlanStart = () => {
  const navigate = useNavigate();
  const def = getNextWeekend();
  const [from, setFrom] = useState(def.from);
  const [to, setTo] = useState(def.to);
  const [city, setCity] = useState<string>("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const stored = getStoredLocation();
    if (stored?.city) setCity(stored.city);
  }, []);

  const handleLocate = async () => {
    setLocating(true);
    try {
      const loc = await requestLocation();
      setCity(loc.city || `${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}`);
      toast.success(loc.city ? `Located: ${loc.city}` : "Location set");
    } catch (e) {
      toast.error("Couldn't get your location. You can set the city below.");
    } finally {
      setLocating(false);
    }
  };

  const handleCityChange = (v: string) => {
    setCity(v);
    const stored = getStoredLocation() || { lat: 0, lng: 0 };
    localStorage.setItem("wiqo:location", JSON.stringify({ ...stored, city: v }));
  };

  const handleNext = () => {
    if (!from || !to) return toast.error("Pick a date range first.");
    if (isBefore(new Date(to), new Date(from))) return toast.error("End date must be after start.");
    sessionStorage.setItem("wiqo:plan", JSON.stringify({ from, to, city }));
    navigate("/plan/mood");
  };

  return (
    <PlanShell step={1}>
      <div className="max-w-3xl mx-auto pt-8 sm:pt-16 text-center">
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4"
        >
          Step 1 · Your window
        </motion.p>
        <h1 className="font-display text-5xl sm:text-7xl leading-[1]">
          When's your <span className="italic text-gradient-sunset">weekend</span>?
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Two days, three days, a long Friday — Wiqo plans whatever shape your weekend takes.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card text-left">
            <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <CalIcon className="h-3.5 w-3.5" /> From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-2 w-full bg-transparent font-display text-3xl outline-none"
            />
          </div>
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card text-left">
            <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <CalIcon className="h-3.5 w-3.5" /> To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-2 w-full bg-transparent font-display text-3xl outline-none"
            />
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-card border border-border p-6 shadow-card text-left">
          <label className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Where you'll be</span>
            <button
              type="button"
              onClick={handleLocate}
              disabled={locating}
              className="text-xs normal-case tracking-normal text-primary hover:underline inline-flex items-center gap-1"
            >
              {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Use current location"}
            </button>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder="Bangalore, Lisbon, anywhere..."
            className="mt-2 w-full bg-transparent font-display text-3xl outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        <button
          onClick={handleNext}
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-sunset px-8 py-4 text-lg font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all"
        >
          Pick my mood
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </PlanShell>
  );
};

export default PlanStart;
