import { Activity, Cpu, Gauge, Radio, Wrench } from "lucide-react";

export default function SpecsSection() {
  const specs = [
    {
      label: "Chassis Architecture",
      value: "FULL CARBON-ALUMINUM",
      icon: Wrench,
    },
    {
      label: "Electronic Speed Control",
      value: "60A WATERPROOF BRUSHLESS",
      icon: Cpu,
    },
    {
      label: "Suspension Setup",
      value: "OIL-FILLED ALUMINUM SHOCKS",
      icon: Activity,
    },
    {
      label: "Radio Frequency",
      value: "2.4GHZ 4-CHANNEL W/ TRIM",
      icon: Radio,
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-muted/30 border-y border-border/60">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Spec Sheet Description & Table */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-primary text-xs font-bold uppercase tracking-wider">
                ENGINEERING SPECS SHEET
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-foreground leading-tight">
                ENGINEERED FOR PIT-LANE DOMINANCE
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Every Apex RC vehicle is meticulously constructed. Swap-out gears,
                adjustable camber angles, and gigawatt LiPo capacity in seconds.
              </p>
            </div>

            {/* Spec Table */}
            <div className="divide-y divide-border/80 border border-border/80 rounded-xl bg-card overflow-hidden shadow-xs">
              {specs.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs text-muted-foreground font-medium">
                    {item.label}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-foreground tracking-tight text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Blueprint CAD Schematic Graphic */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-sky-900/30 bg-gradient-to-br from-[#0c1824] via-[#08121b] to-[#04090e] p-6 sm:p-8 shadow-2xl text-white">
              {/* Technical Blueprint Grid Pattern */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #38bdf810 1px, transparent 1px), linear-gradient(to bottom, #38bdf810 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Blueprint Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-sky-500/20 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                    SYS.SCHEMATIC // SCALE 1:16 PRO-CHASSIS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  REV 4.2.0 • ISO-9001
                </span>
              </div>

              {/* Blueprint Schematic Visual */}
              <div className="relative z-10 aspect-[16/9] flex items-center justify-center">
                <svg
                  viewBox="0 0 700 350"
                  className="w-full h-full stroke-cyan-400/80 fill-none"
                >
                  {/* Chassis outline */}
                  <rect
                    x="120"
                    y="70"
                    width="460"
                    height="210"
                    rx="25"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="stroke-cyan-500/40"
                  />
                  {/* Central Spine */}
                  <line
                    x1="120"
                    y1="175"
                    x2="580"
                    y2="175"
                    strokeWidth="2"
                    className="stroke-cyan-400"
                  />
                  {/* Front Suspension Arms */}
                  <path
                    d="M 170 70 L 150 20 L 220 20 L 200 70"
                    strokeWidth="2"
                    className="stroke-cyan-300"
                  />
                  <path
                    d="M 170 280 L 150 330 L 220 330 L 200 280"
                    strokeWidth="2"
                    className="stroke-cyan-300"
                  />
                  {/* Rear Suspension Arms */}
                  <path
                    d="M 500 70 L 480 20 L 550 20 L 530 70"
                    strokeWidth="2"
                    className="stroke-cyan-300"
                  />
                  <path
                    d="M 500 280 L 480 330 L 550 330 L 530 280"
                    strokeWidth="2"
                    className="stroke-cyan-300"
                  />
                  {/* Wheels (4x) */}
                  <rect
                    x="130"
                    y="10"
                    width="90"
                    height="35"
                    rx="6"
                    strokeWidth="2.5"
                    className="stroke-cyan-200 fill-sky-950/40"
                  />
                  <rect
                    x="130"
                    y="305"
                    width="90"
                    height="35"
                    rx="6"
                    strokeWidth="2.5"
                    className="stroke-cyan-200 fill-sky-950/40"
                  />
                  <rect
                    x="470"
                    y="10"
                    width="90"
                    height="35"
                    rx="6"
                    strokeWidth="2.5"
                    className="stroke-cyan-200 fill-sky-950/40"
                  />
                  <rect
                    x="470"
                    y="305"
                    width="90"
                    height="35"
                    rx="6"
                    strokeWidth="2.5"
                    className="stroke-cyan-200 fill-sky-950/40"
                  />
                  {/* Motor Pod */}
                  <circle
                    cx="430"
                    cy="175"
                    r="45"
                    strokeWidth="2"
                    className="stroke-red-400 fill-red-950/30"
                  />
                  <circle
                    cx="430"
                    cy="175"
                    r="25"
                    strokeWidth="1.5"
                    className="stroke-red-400"
                  />
                  {/* ESC & Receiver box */}
                  <rect
                    x="240"
                    y="110"
                    width="80"
                    height="55"
                    rx="6"
                    strokeWidth="1.5"
                    className="stroke-cyan-300 fill-cyan-950/40"
                  />
                  {/* LiPo Battery Tray */}
                  <rect
                    x="240"
                    y="185"
                    width="140"
                    height="60"
                    rx="6"
                    strokeWidth="1.5"
                    className="stroke-amber-400 fill-amber-950/30"
                  />
                  {/* Differential Gears */}
                  <circle cx="185" cy="175" r="16" strokeWidth="2" />
                  <circle cx="515" cy="175" r="16" strokeWidth="2" />

                  {/* Dimension Arrows */}
                  <line
                    x1="80"
                    y1="70"
                    x2="80"
                    y2="280"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    className="stroke-cyan-400"
                  />
                  <line
                    x1="75"
                    y1="70"
                    x2="85"
                    y2="70"
                    strokeWidth="1"
                    className="stroke-cyan-400"
                  />
                  <line
                    x1="75"
                    y1="280"
                    x2="85"
                    y2="280"
                    strokeWidth="1"
                    className="stroke-cyan-400"
                  />
                </svg>

                {/* Callout Indicator Tag */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md border border-cyan-500/40 rounded-lg px-3 py-1.5 shadow-xl text-center pointer-events-none">
                  <p className="text-[11px] font-mono font-bold text-cyan-300">
                    PRECISION EXTRUSION
                  </p>
                  <p className="text-[9px] font-mono text-neutral-300">
                    48-Pitch Gear Mesh // Twin Differential
                  </p>
                </div>
              </div>

              {/* Blueprint Footer Bar */}
              <div className="relative z-10 flex items-center justify-between border-t border-sky-500/20 pt-3 mt-4 text-[10px] font-mono text-neutral-400">
                <span>DRIVE AXLE: CNC 6061 ALLOY</span>
                <span className="text-cyan-400">STATUS: TELEMETRY LOCKED</span>
                <span>ESC: 3S LIPO CAPABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

