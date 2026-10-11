import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/core/contexts/api.context";
import { useAuth } from "@/core/contexts/auth.context";

import HeroBanner from "./components/hero-banner";
import TrustStrip from "./components/trust-strip";
import CategoryGrid from "./components/category-grid";
import FeaturedMachines from "./components/featured-machines";
import MidPromo from "./components/mid-promo";
import TabsProducts from "./components/tabs-products";
import SpecsSection from "./components/specs-section";
import NewsletterBar from "./components/newsletter-bar";


export default function Home() {
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const { products, wishlist, cart } = useApi();
  const list = products.list || [];
  const loading = products.loading || {};

  const wishlistItems = wishlist.list || [];
  const wishlistedIds = wishlistItems.map((p) => p._id);

  // Load products and wishlist on component mount
  useEffect(() => {
    products.getFeatured(12);
    if (authenticated && typeof wishlist.fetchAll === "function") {
      wishlist.fetchAll();
    }
  }, [authenticated]);

  const handleAddToCart = (product) => {
    if (!authenticated) {
      toast.info("Please sign in to add items to your cart");
      navigate("/login");
      return;
    }

    cart.addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (product) => {
    if (!authenticated) {
      toast.info("Please sign in to use your wishlist");
      navigate("/login");
      return;
    }

    const isWish =
      wishlistedIds.includes(product._id) || Boolean(product?.is_in_wishlist);
    wishlist.toggle(product, isWish);
  };

  const handleNewsletterSubmit = (email) => {
    if (!email || !email.trim()) {
      toast.error("Please enter your email or phone");
      return;
    }
    toast.success("Thanks for subscribing to Paddock Bulletin!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary selection:text-white">
      <CategoryGrid products={list} loading={loading.getAll} />
      <HeroBanner featuredProduct={list[0]} />

      <TrustStrip />

      <FeaturedMachines
        products={list}
        loading={loading.getAll}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        wishlistedIds={wishlistedIds}
      />

      {/* ─── 5. High Speed Mid Promo Banner ──────────────── */}
      <MidPromo />

      {/* ─── 6. Best Sellers / New Arrivals Tabs ─────────── */}
      <TabsProducts
        products={list}
        onAddToCart={handleAddToCart}
      />

      {/* ─── 7. Engineering Spec Sheet & CAD Blueprint ───── */}
      <SpecsSection />

      {/* ─── 8. Newsletter Section (Paddock Bulletin) ─────── */}
      <NewsletterBar onNewsletterSubmit={handleNewsletterSubmit} />


    </div>
  );
}
