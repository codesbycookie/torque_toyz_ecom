import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  Truck,
  ShieldCheck,
  RotateCcw,
  Award,
  Mail,
  MapPin,
  ArrowUp,
  Heart,
  ShoppingCart,
  Package,
  Sparkles,
  Send,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/core/contexts/api.context";
import { toast } from "sonner";

// Clean Automotive & Brand Social Icons
const InstagramIcon = ({ className = "size-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className = "size-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function Footer() {
  const navigate = useNavigate();
  const api = useApi();
  const categoriesList = api.categories?.list || [];

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !/^\S+@\S+\.\S+$/.test(newsletterEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for subscribing! Watch your inbox for updates.");
    setNewsletterEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border/80 bg-card dark:bg-neutral-950 text-foreground dark:text-neutral-200 transition-colors">
      {/* ─── 1. TOP TRUST BADGES STRIP ─── */}
      <div className="border-b border-border/80 bg-muted/40 dark:bg-neutral-900/50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="size-10 sm:size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <Truck className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs sm:text-sm text-foreground dark:text-white truncate">
                  Free Express Shipping
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate">
                  On all prepaid orders over ₹999
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="size-10 sm:size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <ShieldCheck className="size-5 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs sm:text-sm text-foreground dark:text-white truncate">
                  100% Genuine Models
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate">
                  Officially licensed manufacturer replicas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="size-10 sm:size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <RotateCcw className="size-5 text-sky-500" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs sm:text-sm text-foreground dark:text-white truncate">
                  7-Day Easy Returns
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate">
                  Instant replacement for transit flaws
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="size-10 sm:size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <Award className="size-5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs sm:text-sm text-foreground dark:text-white truncate">
                  Armored Packaging
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate">
                  Triple-layer collector box cushioning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN FOOTER CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info & Mission (Col 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3 group inline-flex" aria-label="Torque Toyzz Home">
              <img
                src="/logo.png"
                alt="Torque Toyzz"
                className="size-11 sm:size-12 object-contain group-hover:scale-105 transition-transform duration-200 shrink-0"
              />
              <div className="flex flex-col text-left">
                <span className="font-heading font-extrabold text-xl tracking-tight text-foreground dark:text-white select-none leading-none">
                  Torque <span className="text-primary">Toyzz</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground dark:text-neutral-400 group-hover:text-primary transition-colors duration-200 mt-1 select-none">
                  Engineered for Fun
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground dark:text-neutral-400 leading-relaxed max-w-sm">
              India's premier scale-model destination for automotive purists. We curate officially licensed precision diecast hypercars, Formula 1 champions, and hobby-grade RC drift machines.
            </p>

            {/* Quick Contact & Dispatch */}
            <div className="space-y-2.5 pt-2 text-xs text-muted-foreground dark:text-neutral-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>Chennai, Tamil Nadu, India</span>
              </div>
              <a
                href="mailto:torquetoyzz@gmail.com"
                className="flex items-center gap-2.5 hover:text-foreground dark:hover:text-white transition-colors group"
              >
                <Mail className="size-3.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <span>torquetoyzz@gmail.com</span>
              </a>
            </div>

            {/* Social Channels */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:text-neutral-400 mb-2">
                Follow the Grid
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://instagram.com/torquetoyzz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-xl bg-muted/60 dark:bg-neutral-900 border border-border/80 hover:border-primary/60 text-muted-foreground hover:text-rose-500 dark:text-neutral-300 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                  aria-label="Follow Torque Toyzz on Instagram"
                >
                  <InstagramIcon className="size-4" />
                </a>

                <a
                  href="https://youtube.com/@torquetoyzz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-xl bg-muted/60 dark:bg-neutral-900 border border-border/80 hover:border-primary/60 text-muted-foreground hover:text-red-500 dark:text-neutral-300 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                  aria-label="Subscribe to Torque Toyzz on YouTube"
                >
                  <YoutubeIcon className="size-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Categories & Scale (Col 5-6) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-sm tracking-wide text-foreground dark:text-white uppercase">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground dark:text-neutral-400">
              {categoriesList.slice(0, 5).map((cat) => (
                <li key={cat._id || cat.id}>
                  <Link
                    to={`/products?category=${cat._id || cat.id}`}
                    className="hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/products?sort=latest"
                  className="hover:text-primary transition-colors font-medium text-foreground dark:text-neutral-300"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/products?sort=price-low"
                  className="hover:text-primary transition-colors font-medium text-foreground dark:text-neutral-300"
                >
                  Budget Picks Under ₹2,500
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Orders (Col 7-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm tracking-wide text-foreground dark:text-white uppercase">
              Customer Concierge
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground dark:text-neutral-400">
              <li>
                <Link to="/orders" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Package className="size-3.5 text-primary/80" />
                  <span>Track Your Order</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ShoppingCart className="size-3.5 text-primary/80" />
                  <span>Shopping Cart</span>
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Heart className="size-3.5 text-primary/80" />
                  <span>Saved Collector Wishlist</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors">
                  Collector Profile &amp; Addresses
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-primary transition-colors">
                  Account Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box (Col 9-12) */}
          <div className="lg:col-span-3 space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h4 className="font-heading font-bold text-sm tracking-wide text-foreground dark:text-white uppercase">
                Newsletter
              </h4>
            </div>

            <p className="text-xs text-muted-foreground dark:text-neutral-400 leading-relaxed">
              Get secret drops, low-stock alerts, and 10% off your next rare scale replica.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative flex items-center">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-muted/50 dark:bg-neutral-900 border-border/80 text-xs h-10 pr-10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-neutral-500 rounded-xl focus-visible:ring-primary"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1 size-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send className="size-3.5" />
                </button>
              </div>

              {subscribed && (
                <div className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-medium pt-1">
                  <CheckCircle2 className="size-3.5" />
                  <span>You're on the priority allocation list!</span>
                </div>
              )}
            </form>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 dark:text-neutral-500">
              <Lock className="size-3" />
              <span>Zero spam. Unsubscribe anytime in one click.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. BOTTOM COPYRIGHT & BACK-TO-TOP STRIP ─── */}
      <div className="border-t border-border/80 bg-muted/20 dark:bg-neutral-950 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground dark:text-neutral-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Torque Toyzz. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span>Crafted with precision for diecast &amp; RC enthusiasts.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted-foreground/80 dark:text-neutral-400 font-mono">
              256-BIT SSL ENCRYPTED
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-neutral-400 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-muted dark:hover:bg-neutral-900 border border-border/60"
              aria-label="Scroll back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="size-3 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
