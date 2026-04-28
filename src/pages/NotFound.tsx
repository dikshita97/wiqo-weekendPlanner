import { Link } from "react-router-dom";
import { Logo } from "@/components/wiqo/Logo";

const NotFound = () => (
  <div className="min-h-screen bg-warm grain flex flex-col">
    <header className="container mx-auto py-6"><Logo /></header>
    <main className="flex-1 flex items-center justify-center text-center px-6">
      <div>
        <p className="font-display text-9xl text-gradient-sunset">404</p>
        <h1 className="font-display text-4xl mt-2">This page took the weekend off.</h1>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-foreground text-background px-6 py-3 hover:opacity-90">
          Take me home
        </Link>
      </div>
    </main>
  </div>
);

export default NotFound;
