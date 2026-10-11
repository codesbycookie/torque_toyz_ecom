import { Link } from "react-router-dom";
import logo from "@/assets/hero.png";
import { ArrowLeft, ArrowRight, Mail, Phone } from "lucide-react";

export const CONTACT = {
  email: "torquetoyzz@gmail.com",
  phone: "+91 96001 42392",
  phoneHref: "tel:+919600142392",
};

/* ───────────────────────── section content ───────────────────────── */

function Bullets({ items }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
        >
          <span className="torque-red-bg mt-2 size-1.5 shrink-0 rounded-full" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ContactLinks() {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <a
        href={`mailto:${CONTACT.email}`}
        className="torque-card inline-flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors hover:text-primary"
      >
        <Mail size={15} className="text-primary" />
        {CONTACT.email}
      </a>
      <a
        href={CONTACT.phoneHref}
        className="torque-card inline-flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors hover:text-primary"
      >
        <Phone size={15} className="text-primary" />
        {CONTACT.phone}
      </a>
    </div>
  );
}

/* ───────────────────────── layout ─────────────────────────
   sections: [{ title, text?: string, list?: string[], after?: string, contact?: boolean }]
*/

export function LegalLayout({
  icon: Icon,
  badge,
  title,
  effectiveDate,
  sections,
  otherPage,
}) {
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <style>{`
        .checker-strip {
          background-image:
            linear-gradient(45deg, #000 25%, transparent 25%),
            linear-gradient(-45deg, #000 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #000 75%),
            linear-gradient(-45deg, transparent 75%, #000 75%);
          background-size: 18px 18px;
          background-position: 0 0, 0 9px, 9px -9px, -9px 0px;
          background-color: #fff;
        }
      `}</style>

      {/* Hero band */}
      <header className="torque-dark-gradient relative overflow-hidden">
        <div
          className="torque-red-bg absolute -left-10 top-1/4 h-10 w-[130%] opacity-20"
          style={{ transform: "rotate(-6deg)" }}
        />
        <div
          className="torque-red-bg absolute -left-10 top-1/2 h-4 w-[130%] opacity-10"
          style={{ transform: "rotate(-6deg)" }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-12 pt-8 sm:pb-16">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="torque-border inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed">
                <img src={logo} alt="Torque Toyzz Logo" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                TORQUE TOYZZ
              </span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to store
            </Link>
          </div>

          <div className="mt-12 max-w-2xl">
            <span className="torque-badge mb-5">
              <Icon size={12} />
              {badge}
            </span>
            <h1 className="mb-3 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            {effectiveDate && (
              <p className="text-sm text-white/60">
                Effective date: {effectiveDate}
              </p>
            )}
          </div>
        </div>

        <div className="checker-strip relative h-3 w-full" />
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[220px_1fr] lg:py-14">
        {/* Table of contents */}
        <aside className="hidden lg:block">
          <nav
            aria-label="Sections"
            className="sticky top-8 space-y-0.5 border-l border-border pl-4"
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              On this page
            </p>
            {sections.map((s, i) => (
              <a
                key={s.title}
                href={`#section-${i + 1}`}
                onClick={scrollTo(`section-${i + 1}`)}
                className="block py-1 text-[13px] text-muted-foreground transition-colors hover:text-primary"
              >
                {i + 1}. {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          <div className="torque-card torque-glow space-y-9 p-6 sm:p-10">
            {sections.map((s, i) => (
              <section
                key={s.title}
                id={`section-${i + 1}`}
                className="scroll-mt-8"
              >
                <h2 className="mb-2.5 flex items-center gap-3 text-lg font-semibold tracking-tight">
                  <span className="torque-red-bg inline-flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {s.title}
                </h2>

                {s.text && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.text}
                  </p>
                )}
                {s.list && <Bullets items={s.list} />}
                {s.after && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {s.after}
                  </p>
                )}
                {s.contact && <ContactLinks />}
              </section>
            ))}
          </div>

          {/* Cross link */}
          {otherPage && (
            <Link
              to={otherPage.to}
              className="torque-card group mt-6 flex items-center justify-between gap-4 rounded-md px-6 py-4 transition-colors hover:text-primary"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Also read
                </p>
                <p className="text-sm font-semibold">{otherPage.label}</p>
              </div>
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2026 Torque Toyzz. All rights reserved.
          </p>
        </main>
      </div>
    </div>
  );
}