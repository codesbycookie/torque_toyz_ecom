import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Home, ArrowLeft, Car, AlertCircle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 relative">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Subtle pill indicator */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Error 404 • Track Missing</span>
        </div>

        {/* Big 404 Typography */}
        <div className="relative">
          <div className="text-8xl sm:text-9xl font-black tracking-tighter text-foreground/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Drifted Off Track!
            </h1>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          The scale model, garage collection, or page you were looking for doesn&apos;t seem to exist, or may have been relocated.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-md">
              <Home className="h-4 w-4" />
              Return to Showroom
            </Button>
          </Link>

          <Link to="/products" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold gap-2">
              <Car className="h-4 w-4" />
              Explore All Models
            </Button>
          </Link>

          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Popular Categories Shortcut */}
        <div className="pt-8 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Popular Collections
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: "Supercars", path: "/products" },
              { label: "Classic Muscle", path: "/products" },
              { label: "JDM Legends", path: "/products" },
              { label: "Hypercars", path: "/products" },
            ].map((tag) => (
              <Link
                key={tag.label}
                to={tag.path}
                className="px-3 py-1 rounded-full text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border/40"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
