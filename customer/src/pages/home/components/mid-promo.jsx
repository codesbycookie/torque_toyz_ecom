import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MidPromo() {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1c181a] via-[#1a1416] to-[#120e10] border border-white/10 text-white p-6 sm:p-10 lg:p-12 shadow-2xl">
          {/* Subtle angled speed slash */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
                PRO-GRADE SCALE ARCHITECTURE
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-none text-white">
                BIG SPEED.{" "}
                <span className="text-primary block mt-1 drop-shadow-sm">
                  SMALL PACKAGE.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
                Pro-space brushless motors with 100m wireless range. Engineered for ultimate
                pavement shredding with responsive active-gyro control and oil-core
                waterproof ESC.
              </p>

              <div className="pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate("/products")}
                  className="bg-primary hover:bg-secondary text-white font-bold tracking-wider uppercase text-xs px-6 h-11 rounded-lg shadow-lg shadow-primary/25 transition-all"
                >
                  <span>EXPLORE BEST SELLERS</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </div>

              {/* Feature checkmarks */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-xs text-neutral-300 font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <span>100M RANGE</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <span>45+ KM/H TOP SPEED</span>
                </div>
              </div>
            </div>

            {/* Right Mechanical Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-white/15 bg-neutral-950/80 shadow-inner group">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                  alt="Chassis assembly"
                  className="size-full object-cover aspect-[16/10] opacity-85 group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
                  <span className="bg-black/70 px-2 py-0.5 rounded border border-white/10">
                    CHASSIS SPECS: 1:16 SCALE
                  </span>
                  <span className="text-primary font-black">DIRECT DRIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

