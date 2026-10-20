import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "@/core/contexts/api.context";
import { useEcom } from "@/core/contexts/ecom.context";
import {
  AmazonProductCard,
  AmazonProductCardSkeleton,
} from "@/modules/product/product.components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Car,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    id: 1,
    title: "Precision Engineering. Collector's Soul.",
    subtitle:
      "Premium 1:18 & 1:24 diecast hypercars, classic roadsters & authentic racing liveries.",
    tag: "New Arrivals 2026",
    badge: "Official Collector Drop",
    ctaText: "Explore Collection",
    ctaLink: "/products?sort=latest",
    image: "/cars/gt3_rs.jpg",
    accent: "bg-gradient-to-t from-black/80 via-black/50 to-black/20",
  },
  {
    id: 2,
    title: "Formula 1 & Endurance Legends",
    subtitle:
      "Championship winning beasts with aerodynamic detail, display cases & verified specs.",
    tag: "Motorsport Tier",
    badge: "Hot Picks",
    ctaText: "Shop Race Cars",
    ctaLink: "/products?search=F1",
    image: "/cars/redbull_f1.jpg",
    accent: "bg-gradient-to-t from-black/80 via-black/50 to-black/20",
  },
  {
    id: 3,
    title: "High-Speed RC Drifters & 4WD Crawlers",
    subtitle:
      "Proportional steering, replaceable slicks & brushless motors engineered for pure track dominance.",
    tag: "RC Performance",
    badge: "Limited Stock",
    ctaText: "View RC Fleet",
    ctaLink: "/products?sort=price-high",
    image: "/cars/rx7_lbwk.jpg",
    accent: "bg-gradient-to-t from-black/80 via-black/50 to-black/20",
  },
];

export default function Home() {
  const { products, categories, wishlist, cart } = useApi();
  const { recentlyViewed } = useEcom();
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);

  // Store data directly from modules
  const productsList = products.list || [];
  const categoriesList = categories.list || [];
  const loading = products.loading || {};
  const wishlistItems = wishlist.list || [];
  const wishlistedIds = wishlistItems.map((p) => p._id);

  // Fetch real data on mount strictly using registered module actions
  useEffect(() => {
    products.getAll({ limit: 16, sortBy: "createdAt", order: "desc" });
    categories.getAll({ limit: 50, active: true });
    wishlist.fetchAll?.();
  }, []);

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (product) => {
    cart.addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (product) => {
    const isWish =
      wishlistedIds.includes(product._id) || Boolean(product?.is_in_wishlist);
    wishlist.toggle(product, isWish);
  };

  // Derive specialized sections from real backend products
  const featuredPicks = useMemo(() => {
    return productsList.slice(0, 4);
  }, [productsList]);

  const underPricePicks = useMemo(() => {
    // Under ₹2,500 deals or cheapest 4
    const affordable = productsList.filter((p) => Number(p.price || 0) <= 2500);
    return (affordable.length >= 4 ? affordable : productsList).slice(0, 4);
  }, [productsList]);

  const trendingProducts = useMemo(() => {
    return productsList.slice(4, 12);
  }, [productsList]);

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── 1. AMAZON-STYLE SUB-NAV CATEGORY RIBBON ────────────────── */}
      <div className="bg-card border-b border-border/80 sticky top-18 z-40 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 text-xs font-medium">
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors shrink-0"
            >
              <Layers className="size-3.5" />
              <span>All Products</span>
            </button>

            <div className="h-4 w-px bg-border shrink-0 mx-1" />

            {categoriesList.slice(0, 8).map((cat) => {
              const catId = cat._id || cat.slug || cat.id;
              return (
                <button
                  key={catId}
                  onClick={() => navigate(`/products?category=${catId}`)}
                  className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors shrink-0 whitespace-nowrap"
                >
                  {cat.name}
                </button>
              );
            })}

            <button
              onClick={() => navigate("/products?sort=price-low")}
              className="ml-auto hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 transition-colors shrink-0 font-semibold"
            >
              <Zap className="size-3.5" />
              <span>Deals &amp; Offers</span>
            </button>
          </div>
        </div>
      </div>
      ```
      {/* ─── 2. HERO CAROUSEL ────────────────── */}
      <section className="relative overflow-hidden border-b border-border/80 bg-neutral-950">
        <div className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] flex items-center">
          {/* Background image & gradient blend */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover object-center duration-700"
            />
            <div className={cn("absolute inset-0 ", currentSlide.accent)} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          {/* Slide Content */}
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 w-full">
            <div className="max-w-2xl space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-sm"
                >
                  {currentSlide.badge}
                </Badge>
                <span className="text-xs text-neutral-300 font-semibold tracking-wide">
                  {currentSlide.tag}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] drop-shadow-md">
                {currentSlide.title}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-xl leading-relaxed">
                {currentSlide.subtitle}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate(currentSlide.ctaLink)}
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-md hover:scale-102 transition-all active:scale-95"
                >
                  {currentSlide.ctaText}
                  <ArrowRight className="ml-2 size-4" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/products")}
                  className="rounded-full bg-background/20 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold"
                >
                  Browse Catalog
                </Button>
              </div>
            </div>
          </div>

          {/* Carousel navigation controls */}
          <button
            onClick={() =>
              setActiveSlide(
                (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-transform hover:scale-110 border border-white/10"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            onClick={() =>
              setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-transform hover:scale-110 border border-white/10"
            aria-label="Next Slide"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Slide dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  activeSlide === idx
                    ? "w-8 bg-primary"
                    : "w-2 bg-white/40 hover:bg-white/70",
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      ``` for this too
      {/* ─── 3. AMAZON-STYLE OVERLAPPING CATEGORY & FEATURE CARDS ────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 relative z-30 mb-12 sm:mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {/* Card 1: Shop Categories Quick Jump */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center justify-between">
                <span>Top Categories</span>
                <Car className="size-4 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(categoriesList.length > 0
                  ? categoriesList.slice(0, 4)
                  : [
                      { name: "Diecast Models", icon: "🏎️" },
                      { name: "RC Cars", icon: "🎮" },
                      { name: "F1 Collectibles", icon: "🏁" },
                      { name: "Supercars", icon: "✨" },
                    ]
                ).map((cat, i) => {
                  const catId = cat._id || cat.slug || cat.id;
                  return (
                    <button
                      key={catId || i}
                      onClick={() =>
                        navigate(
                          catId ? `/products?category=${catId}` : "/products",
                        )
                      }
                      className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 border border-border/60 hover:border-primary/40 text-left transition-all duration-200 group/item"
                    >
                      <p className="text-xs font-bold line-clamp-1 group-hover/item:text-primary transition-colors">
                        {cat.name}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        Explore →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="text-xs font-semibold text-primary hover:underline pt-5 mt-1 block text-left transition-colors"
            >
              See all categories →
            </button>
          </div>

          {/* Card 2: Featured Pick of the Week */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Today's Top Pick
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5"
                >
                  Featured
                </Badge>
              </div>
              {featuredPicks[0] ? (
                <div
                  onClick={() =>
                    navigate(
                      `/products/${
                        featuredPicks[0].slug || featuredPicks[0]._id
                      }`,
                    )
                  }
                  className="cursor-pointer group/pick space-y-3"
                >
                  <div className="aspect-video rounded-xl bg-muted/40 p-2.5 overflow-hidden flex items-center justify-center border border-border/50">
                    <img
                      src={
                        featuredPicks[0].images?.[0] || "/cars/bmw_m4_gt3.jpg"
                      }
                      alt={featuredPicks[0].name}
                      className="size-full object-contain group-hover/pick:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-foreground group-hover/pick:text-primary line-clamp-1 transition-colors">
                      {featuredPicks[0].name}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-foreground">
                        ₹{Number(featuredPicks[0].price || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-primary font-bold">
                        Free Delivery
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Loading top pick...
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/products?sort=latest")}
              className="text-xs font-semibold text-primary hover:underline pt-4 block text-left transition-colors"
            >
              See featured collection →
            </button>
          </div>

          {/* Card 3: Affordable Deals Under ₹2,500 */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Budget Picks
                </h3>
                <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Under ₹2,500
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {underPricePicks.slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    onClick={() =>
                      navigate(`/products/${item.slug || item._id}`)
                    }
                    className="cursor-pointer group/deal p-2 rounded-xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/60 transition-all duration-200"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-background p-1.5 mb-1.5 border border-border/40 flex items-center justify-center">
                      <img
                        src={item.images?.[0] || "/cars/shelby_cobra.jpg"}
                        alt={item.name}
                        className="size-full object-contain group-hover/deal:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-foreground line-clamp-1 text-center">
                      ₹{Number(item.price || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate("/products?sort=price-low")}
              className="text-xs font-semibold text-primary hover:underline pt-4 block text-left transition-colors"
            >
              Shop all budget deals →
            </button>
          </div>

          {/* Card 4: Trust & Authenticity Guarantee */}
          <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-border/80 rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Award className="size-5 text-primary shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Why Torque Toyzz?
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">100% Authentic:</strong>{" "}
                    Directly imported officially licensed collectibles.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Truck className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">
                      Armored Shipping:
                    </strong>{" "}
                    Triple-bubble wrapped collector box protection.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RotateCcw className="size-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">
                      Easy 7-Day Returns:
                    </strong>{" "}
                    Hassle-free replacement policy.
                  </span>
                </li>
              </ul>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/products")}
              className="w-full mt-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
      {/* ─── 4. TRENDING RELEASES SECTION (REAL BACKEND PRODUCTS) ──── */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 border-b border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="size-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Trending Releases &amp; New Arrivals
              </h2>
              <p className="text-xs text-muted-foreground">
                Hand-picked high detail diecast and RC cars ready to ship
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/products?sort=latest")}
            className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
          >
            View all
            <ArrowRight className="ml-1 size-3.5" />
          </Button>
        </div>

        {loading.getAll ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <AmazonProductCardSkeleton key={i} />
            ))}
          </div>
        ) : trendingProducts.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl">
            <Package className="size-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">
              No products found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {trendingProducts.map((product) => (
              <AmazonProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={
                  wishlistedIds.includes(product._id) ||
                  Boolean(product?.is_in_wishlist)
                }
              />
            ))}
          </div>
        )}
      </section>
      {/* ─── 5. FULL CATEGORY EXPLORATION TILES ─────────────────────── */}
      {categoriesList.length > 0 && (
        <section className="bg-card/50 border-y border-border/80 py-12">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Explore by Category
                </h2>
                <p className="text-xs text-muted-foreground">
                  Browse by vehicle class, scale, or brand
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/products")}
                className="text-xs font-semibold"
              >
                All Departments
                <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categoriesList.map((cat) => {
                const catId = cat._id || cat.slug || cat.id;
                return (
                  <button
                    key={catId}
                    onClick={() => navigate(`/products?category=${catId}`)}
                    className="p-4 rounded-xl border border-border/70 bg-card hover:bg-card/90 hover:border-primary/50 transition-all text-center flex flex-col items-center justify-center gap-2 group shadow-2xs cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary text-primary group-hover:text-primary-foreground transition-colors">
                      <Car className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {cat.name}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Shop Now &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}
      {/* ─── 6. BEST SELLERS / PERFORMANCE COLLECTION ──────────────── */}
      {productsList.length > 8 && (
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6 border-b border-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="size-4.5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Collector's Vault &amp; Best Sellers
                </h2>
                <p className="text-xs text-muted-foreground">
                  Highly rated precision scale models with limited quantities
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/products?sort=name-asc")}
              className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
            >
              View catalog
              <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {productsList.slice(0, 4).map((product) => (
              <AmazonProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={
                  wishlistedIds.includes(product._id) ||
                  Boolean(product?.is_in_wishlist)
                }
              />
            ))}
          </div>
        </section>
      )}
      {/* ─── 7. RECENTLY VIEWED ROW (AMAZON STYLE) ─────────────────── */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border/80">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Inspired by your browsing history
            </h3>
            <span className="text-xs text-muted-foreground">
              {recentlyViewed.length} items viewed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {recentlyViewed.slice(0, 4).map((product) => (
              <AmazonProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={
                  wishlistedIds.includes(product._id) ||
                  Boolean(product?.is_in_wishlist)
                }
              />
            ))}
          </div>
        </section>
      )}
      {/* ─── 8. BOTTOM TRUST STRIP ──────────────────────────────────── */}
      <section className="bg-card border-t border-border/80 py-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Truck className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">
                  Free Shipping
                </p>
                <p className="text-xs text-muted-foreground">
                  On all prepaid orders over ₹999
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">
                  Secure Checkout
                </p>
                <p className="text-xs text-muted-foreground">
                  256-bit SSL encrypted payments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <RotateCcw className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">
                  7-Day Replacement
                </p>
                <p className="text-xs text-muted-foreground">
                  Instant damage or defect coverage
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Award className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">
                  Collector Certified
                </p>
                <p className="text-xs text-muted-foreground">
                  100% genuine diecast &amp; RC brands
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
