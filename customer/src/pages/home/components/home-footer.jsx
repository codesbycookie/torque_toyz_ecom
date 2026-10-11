import { Link } from "react-router-dom";

export default function HomeFooter() {
  const columns = [
    {
      title: "SHOP FLEET",
      links: [
        { label: "High Speed RC Buggies", path: "/products" },
        { label: "4x4 Monster Bashers", path: "/products" },
        { label: "On-Road TC Racers", path: "/products" },
        { label: "1:18 Die-Cast Classics", path: "/products" },
        { label: "LiPo Batteries & ESCs", path: "/products" },
      ],
    },
    {
      title: "PIT SUPPORT",
      links: [
        { label: "Spare Parts Finder", path: "/products" },
        { label: "Express Courier Dispatch", path: "/orders" },
        { label: "6-Month Chassis Warranty", path: "/settings" },
        { label: "Manuals & Exploded Views", path: "/products" },
        { label: "Return & Tune Guide", path: "/orders" },
      ],
    },
    {
      title: "COMPANY",
      links: [
        { label: "Racing Heritage", path: "/products" },
        { label: "Official Track Partners", path: "/products" },
        { label: "National Championships", path: "/products" },
        { label: "Hobby Guard CSR", path: "/products" },
        { label: "Engineering Careers", path: "/products" },
      ],
    },
    {
      title: "COMPLIANCE",
      links: [
        { label: "Privacy Policy", path: "/settings" },
        { label: "Terms of Service", path: "/settings" },
        { label: "Safety Test Certifications", path: "/settings" },
        { label: "LiPo Safe Handling Guide", path: "/settings" },
      ],
    },
  ];

  return (
    <footer className="bg-[#120e0f] text-neutral-400 text-xs border-t border-white/10 pt-12 pb-8">
      <div className="container mx-auto px-4">
        {/* 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      to={link.path}
                      className="hover:text-primary transition-colors text-neutral-400 no-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          {/* Left Badges */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
              <span className="size-1.5 rounded-full bg-primary" />
              100% Genuine Models
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
              <span className="size-1.5 rounded-full bg-primary" />
              Fast & Safe Shipping
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
              <span className="size-1.5 rounded-full bg-primary" />
              Factory Direct Support
            </span>
          </div>

          {/* Right Copyright */}
          <p className="text-center md:text-right">
            © 2024 TorqueToyz Technologies Ltd. All Rights Reserved. Engineered for Extreme Performance.
          </p>
        </div>
      </div>
    </footer>
  );
}

