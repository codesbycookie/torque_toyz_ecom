import { ShieldCheck, Truck, Award, RotateCcw, ArrowRight } from "lucide-react";

export default function TrustStrip() {
  const pillars = [
    {
      num: "01",
      icon: ShieldCheck,
      title: "Secure Payments",
      subtitle: "Bank-grade 256-bit SSL encryption with Instant UPI, Cards, and Net Banking safety.",
      tag: "100% SECURE CHECKOUT",
    },
    {
      num: "02",
      icon: Truck,
      title: "Express Dispatch",
      subtitle: "Priority air & express surface delivery across Pan-India with live telemetry tracking.",
      tag: "PAN-INDIA COURIER",
    },
    {
      num: "03",
      icon: Award,
      title: "Genuine Quality",
      subtitle: "Factory-calibrated OEM parts, original batteries, and authentic collectible editions.",
      tag: "VERIFIED OEM PRODUCTS",
    },
    {
      num: "04",
      icon: RotateCcw,
      title: "7-Day Easy Returns",
      subtitle: "Hassle-free replacement policy with instant doorstep pickups and rapid resolutions.",
      tag: "NO-HASSLE GUARANTEE",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-neutral-50/80 dark:bg-neutral-950/40 py-8 sm:py-14 lg:py-28 lg:min-h-[48vh] flex flex-col justify-center border-b border-border/70">
      {/* Decorative ambient background accents */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 size-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 size-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 my-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12 space-y-1.5 sm:space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold tracking-widest text-primary uppercase">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span>THE TORQUE PLEDGE • TRACK-SIDE SERVICE</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-foreground">
            BUILT FOR SPEED. BACKED BY TRUST.
          </h2>

          <p className="text-[11px] sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">
            Every vehicle, battery, and replacement part is covered by our pit-crew
            guarantee from checkout to your first race run.
          </p>
        </div>

        {/* 4 Dimensional Pillars (horizontal scroll on mobile, grid on desktop) */}
        <div
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="w-[240px] sm:w-auto shrink-0 snap-start group relative rounded-xl sm:rounded-2xl border border-border/80 bg-card p-4 sm:p-7 shadow-xs sm:shadow-sm hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Top red accent highlight bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-primary transition-colors" />

                {/* Big watermark number */}
                <span className="absolute top-3 right-4 sm:top-4 sm:right-5 text-3xl sm:text-4xl font-black text-muted-foreground/15 group-hover:text-primary/15 transition-colors select-none font-mono">
                  {item.num}
                </span>

                <div className="space-y-3 sm:space-y-4">
                  {/* Layered glowing icon */}
                  <div className="size-10 sm:size-13 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-4 ring-primary/5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/20 transition-all duration-300 shadow-xs">
                    <Icon className="size-5 sm:size-6 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1 sm:space-y-1.5">
                    <h3 className="text-sm sm:text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom pill tag */}
                <div className="pt-3 sm:pt-5 mt-3 sm:mt-5 border-t border-border/60">
                  <span className="inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                    {item.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
