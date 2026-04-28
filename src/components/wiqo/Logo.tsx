import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`inline-flex items-center gap-2 group ${className}`}>
    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-sunset shadow-soft transition-transform group-hover:rotate-12">
      <span className="font-display text-xl text-primary-foreground italic">w</span>
    </span>
    <span className="font-display text-3xl tracking-tight text-foreground">Wiqo</span>
  </Link>
);
