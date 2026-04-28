import { ShoppingBag, ExternalLink } from "lucide-react";

const SERVICES = [
  { name: "Blinkit", href: "https://blinkit.com/s/?q=board%20games", color: "bg-yellow-400 text-zinc-900" },
  { name: "Zepto", href: "https://www.zeptonow.com/search?query=board%20games", color: "bg-violet-600 text-white" },
  { name: "Instamart", href: "https://www.swiggy.com/instamart/search?custom_back=true&query=board%20games", color: "bg-orange-500 text-white" },
  { name: "Amazon", href: "https://www.amazon.in/s?k=board+games", color: "bg-foreground text-background" },
];

export const InstantOrder = () => (
  <div>
    <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
      <ShoppingBag className="h-5 w-5 text-primary" /> Get the games delivered now
    </h2>
    <div className="grid sm:grid-cols-2 gap-3">
      {SERVICES.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          className="group rounded-2xl bg-card border border-border p-4 shadow-card hover:shadow-soft hover:border-primary/40 transition-all flex items-center justify-between"
        >
          <span className="flex items-center gap-3">
            <span className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold ${s.color}`}>
              {s.name[0]}
            </span>
            <span>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">Order in 10 minutes</div>
            </span>
          </span>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        </a>
      ))}
    </div>
  </div>
);
