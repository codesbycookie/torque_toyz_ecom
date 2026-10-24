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
    toast.success("Welcome to the Pit Lane VIP Club! Watch your inbox for secret drops.");
    setNewsletterEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border/80 bg-neutral-950 text-neutral-200 transition-colors">
      {/* ─── 1. TOP TRUST BADGES STRIP ─── */}
      <div className="border-b border-border/40 bg-neutral-900/50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="size-10 sm:size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Truck className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                  Free Express Shipping
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  On all prepaid orders over ₹999
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="size-10 sm:size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="size-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                  100% Genuine Models
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  Officially licensed manufacturer replicas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="size-10 sm:size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <RotateCcw className="size-5 text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                  7-Day Easy Returns
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  Instant replacement for in-transit transit flaws
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="size-10 sm:size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Award className="size-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                  Armored Packaging
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
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
            <Link to="/" className="flex items-center gap-3 group inline-block">
              <div className="relative size-10 rounded-xl bg-neutral-900 p-1 border border-border/80 shadow-xs group-hover:border-primary/50 transition-all flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src="/logo.png"
                  alt="Torque Toyzz"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white select-none leading-none">
                  Torque <span className="text-primary">Toyzz</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-neutral-400 group-hover:text-primary transition-colors duration-200 mt-1 select-none">
                  Engineered for Fun
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              India's premier scale-model destination for automotive purists. We curate officially licensed precision diecast hypercars, Formula 1 champions, and hobby-grade RC drift machines.
            </p>

            {/* Quick Contact & Dispatch */}
            <div className="space-y-2 pt-2 text-xs text-neutral-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>Central Hub: Bengaluru, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-3.5 text-primary shrink-0" />
                <span>concierge@torquetoyzz.com</span>
              </div>
            </div>
          </div>

          {/* Quick Categories & Scale (Col 5-6) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-sm tracking-wide text-white uppercase">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
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
                  className="hover:text-primary transition-colors font-medium text-neutral-300"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/products?sort=price-low"
                  className="hover:text-primary transition-colors font-medium text-neutral-300"
                >
                  Budget Picks Under ₹2,500
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Orders (Col 7-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm tracking-wide text-white uppercase">
              Customer Concierge
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
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

          {/* VIP Newsletter Box (Col 9-12) */}
          <div className="lg:col-span-3 space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h4 className="font-heading font-bold text-sm tracking-wide text-white uppercase">
                Pit Lane VIP Club
              </h4>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Get secret drops, low-stock alerts, and 10% off your next rare scale replica.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative flex items-center">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-neutral-900 border-border/80 text-xs h-10 pr-10 text-white placeholder:text-neutral-500 rounded-xl focus-visible:ring-primary"
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
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium pt-1">
                  <CheckCircle2 className="size-3.5" />
                  <span>You're on the priority allocation list!</span>
                </div>
              )}
            </form>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <Lock className="size-3" />
              <span>Zero spam. Unsubscribe anytime in one click.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. BOTTOM COPYRIGHT & BACK-TO-TOP STRIP ─── */}
      <div className="border-t border-border/40 bg-neutral-950 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Torque Toyzz. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span>Crafted with precision for diecast &amp; RC enthusiasts.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-neutral-400 font-mono">
              256-BIT SSL ENCRYPTED
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-neutral-900 border border-border/40"
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
