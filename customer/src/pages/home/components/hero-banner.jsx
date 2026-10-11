import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Gauge, Radio, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroBanner({ featuredProduct }) {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(1);

  const heroSlides = [
    {
      id: 1,
      tag: "CHAMPIONSHIP SPEC",
      title: featuredProduct?.name || "Apex 101-38 Hurricane",
      image:
        featuredProduct?.images?.[0] ||
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1200&q=80",
      topSpeed: "45+ KM/H",
      link: featuredProduct ? `/products/${featuredProduct.slug || featuredProduct._id}` : "/products",
    },
    {
      id: 2,
      tag: "DESERT RACER",
      title: "Apex Baja 4WD Buggy",
      image:
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
      topSpeed: "52+ KM/H",
      link: "/products",
    },
    {
      id: 3,
      tag: "PRO DRIFT SPEC",
      title: "Torque GT-R Horizon",
      image:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
      topSpeed: "40+ KM/H",
      link: "/products",
    },
  ];

  const currentSlide = heroSlides.find((s) => s.id === activeSlide) || heroSlides[0];

  return (
    <section className="relative overflow-hidden bg-white dark:bg-card text-foreground lg:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100dvh-4rem)] flex flex-col justify-center py-6 sm:py-10 lg:py-12 border-b border-border/60">
      {/* Background soft red ambient glow */}
      <div className="absolute top-0 right-1/4 -mt-20 size-96 rounded-full bg-primary/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 size-80 rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: Headline and Content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-wider text-primary uppercase">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>RC FLEET 2024 EDITION • Dynamic Body</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-none uppercase">
              UNLEASH THE{" "}
              <span className="text-primary block mt-1 drop-shadow-xs">
                NEED FOR SPEED
              </span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              Discover high-performance R/C cars and collectible die-cast models built for
              adrenaline. Precision throttle control, race-tuned off-road shock absorbing,
              and 2.4Ghz anti-competitive 3-vehicles.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="lg"
                onClick={() => navigate("/products")}
                className="bg-primary hover:bg-secondary text-primary-foreground font-bold tracking-wider uppercase text-xs sm:text-sm px-5 sm:px-6 h-10 sm:h-12 rounded-lg shadow-md shadow-primary/20 transition-all active:scale-95"
              >
                <span>SHOP RC CARS</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById("featured-machines");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate("/products");
                  }
                }}
                className="border-border bg-background hover:bg-muted text-foreground font-semibold tracking-wider uppercase text-xs sm:text-sm px-4 sm:px-6 h-10 sm:h-12 rounded-lg transition-all"
              >
                <span>VIEW MACHINES ↓</span>
              </Button>
            </div>

            {/* Mobile Quick-Jump Pills (visible on mobile only) */}
            <div
              className="flex items-center gap-2 pt-1 sm:hidden overflow-x-auto pb-1 text-[11px] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <button
                type="button"
                onClick={() => {
                  document.getElementById("featured-machines")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="shrink-0 bg-neutral-100 dark:bg-neutral-800 hover:bg-primary hover:text-white px-3 py-1 rounded-full font-bold text-foreground border border-border/80 transition-colors"
              >
                ⚡ Race Machines
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="shrink-0 bg-neutral-100 dark:bg-neutral-800 hover:bg-primary hover:text-white px-3 py-1 rounded-full font-bold text-foreground border border-border/80 transition-colors"
              >
                🏷️ Categories
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("best-sellers")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="shrink-0 bg-neutral-100 dark:bg-neutral-800 hover:bg-primary hover:text-white px-3 py-1 rounded-full font-bold text-foreground border border-border/80 transition-colors"
              >
                🔥 Best Sellers
              </button>
            </div>

            {/* Key Stats Bar */}
            <div className="pt-4 sm:pt-6 border-t border-border/80 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg">
              <div>
                <p className="text-[9px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  TOP VELOCITY
                </p>
                <p className="text-lg sm:text-2xl font-black text-foreground mt-0.5">
                  45<span className="text-xs sm:text-sm font-semibold text-primary">+</span>{" "}
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">KM/H</span>
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">Brushless Cars</p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  RESPONSE SPEED
                </p>
                <p className="text-lg sm:text-2xl font-black text-foreground mt-0.5">
                  2.4{" "}
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">GHZ</span>
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">Pro Control</p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  DRIVE TRAIN
                </p>
                <p className="text-lg sm:text-2xl font-black text-foreground mt-0.5">
                  4WD{" "}
                  <span className="text-[10px] sm:text-xs font-semibold text-primary">TORQUE</span>
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">Twin Metal Diff</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Machine Card */}
          <div className="lg:col-span-5">
            <div
              onClick={() => navigate(currentSlide.link)}
              className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-border/80 bg-neutral-900 shadow-xl cursor-pointer transition-all duration-300 hover:border-primary/50"
            >
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />

              {/* Dark gradient overlay for typography readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Bottom overlay badge & title */}
              <div className="absolute bottom-4 left-4 right-16 space-y-1">
                <span className="inline-block bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm">
                  {currentSlide.tag}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-md group-hover:text-red-200 transition-colors truncate">
                  {currentSlide.title}
                </h3>
              </div>

              {/* Slider switch button indicator */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                {heroSlides.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide(s.id);
                    }}
                    className={`size-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-all ${
                      activeSlide === s.id
                        ? "bg-primary text-white scale-110 shadow-md"
                        : "bg-black/50 text-neutral-300 hover:bg-black/70 border border-white/20"
                    }`}
                  >
                    {s.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

