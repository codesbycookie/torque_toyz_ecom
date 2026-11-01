import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/core/contexts/auth.context";
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
  Compass,
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
  const { home, wishlist, cart } = useApi();
  const { user } = useAuth();
  const { recentlyViewed } = useEcom();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSlide, setActiveSlide] = useState(0);

  const { data: homeData, loading, fetchHomeData } = home;

  // Single unified API fetch on mount or user transition
  useEffect(() => {
    fetchHomeData();
  }, [user?._id]);

  // Clean data slices strictly populated from single home endpoint
  const productsList = homeData?.products || [];
  const categoriesList = homeData?.categories || [];
  const featuredPicks = homeData?.featuredPicks?.length
    ? homeData.featuredPicks
    : productsList.slice(0, 4);
  const underPricePicks = homeData?.budgetPicks?.length
    ? homeData.budgetPicks
    : productsList.filter((p) => Number(p.price || 0) <= 2500).slice(0, 4);
  const trendingProducts = homeData?.trendingProducts?.length
    ? homeData.trendingProducts
    : productsList.slice(0, 12);
  const bestSellers = homeData?.bestSellers?.length
    ? homeData.bestSellers
    : productsList.slice(4, 12);
  const recommendations = homeData?.recommendations?.length
    ? homeData.recommendations
    : productsList.slice(0, 8);

  const wishlistedIds = user
    ? (wishlist.list?.length
        ? wishlist.list.map((p) => p._id)
        : homeData?.wishlistIds || [])
    : [];

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Please login to add items to your cart");
      navigate("/login", { state: { from: location } });
      return;
    }
    return cart.addToCart(product, 1);
  };

  const handleToggleWishlist = (product) => {
    if (!user) {
      toast.error("Please login to manage your wishlist");
      navigate("/login", { state: { from: location } });
      return;
    }
    const isWish =
      wishlistedIds.includes(product._id) || Boolean(product?.is_in_wishlist);
    wishlist.toggle(product, isWish);
  };



  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── 1. HERO CAROUSEL ────────────────── */}
      <section className="relative overflow-hidden border-b border-border/80 bg-neutral-950">
        <div className="relative min-h-[400px] sm:min-h-[480px] lg:min-h-[540px] flex items-center">
          {/* Background image & multi-directional cinematic gradient blend */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover object-center transition-transform duration-1000 scale-100"
            />
            {/* Horizontal gradient: deep black on the left for maximum text contrast, fading smoothly on the right */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/75 to-neutral-950/20 lg:to-transparent" />
            {/* Vertical gradient from bottom: seamless blend into neutral-950 base without milky wash */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
            {/* Top subtle vignette to blend with sub-navigation ribbon */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-transparent" />
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

              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate(currentSlide.ctaLink)}
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-md hover:scale-102 transition-all active:scale-95 text-xs sm:text-sm h-10 sm:h-11 cursor-pointer"
                >
                  {currentSlide.ctaText}
                  <ArrowRight className="ml-2 size-4" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/products")}
                  className="rounded-full bg-background/20 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold text-xs sm:text-sm h-10 sm:h-11 cursor-pointer"
                >
                  Browse Catalog
                </Button>
              </div>
            </div>
          </div>

          {/* Carousel navigation controls (Desktop & Tablet) */}
          <button
            onClick={() =>
              setActiveSlide(
                (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
              )
            }
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white items-center justify-center transition-transform hover:scale-110 border border-white/10 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            onClick={() =>
              setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
            }
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white items-center justify-center transition-transform hover:scale-110 border border-white/10 cursor-pointer"
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

      {/* ─── 3. AMAZON-STYLE OVERLAPPING CATEGORY & FEATURE CARDS ────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-16 relative z-30 mb-12 sm:mb-16">
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
                  const displayName =
                    cat.name.length > 18 ? `${cat.name.slice(0, 16)}...` : cat.name;
                  return (
                    <button
                      key={catId || i}
                      title={cat.name}
                      onClick={() =>
                        navigate(
                          catId ? `/products?category=${catId}` : "/products",
                        )
                      }
                      className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 border border-border/60 hover:border-primary/40 text-left transition-all duration-200 group/item"
                    >
                      <p className="text-xs font-bold truncate group-hover/item:text-primary transition-colors">
                        {displayName}
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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
              {categoriesList.slice(0, 12).map((cat) => {
                const catId = cat._id || cat.slug || cat.id;
                const displayName =
                  cat.name.length > 20 ? `${cat.name.slice(0, 18)}...` : cat.name;
                return (
                  <button
                    key={catId}
                    title={cat.name}
                    onClick={() => navigate(`/products?category=${catId}`)}
                    className="p-4 rounded-xl border border-border/70 bg-card hover:bg-card/90 hover:border-primary/50 transition-all text-center flex flex-col items-center justify-center gap-2 group shadow-2xs cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary text-primary group-hover:text-primary-foreground transition-colors">
                      <Car className="size-5" />
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {displayName}
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
      {(bestSellers.length > 0 || productsList.length > 4) && (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {(bestSellers.length > 0 ? bestSellers.slice(0, 4) : productsList.slice(0, 4)).map((product) => (
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
      {/* ─── 7. ALGORITHMIC / PERSONALIZED RECOMMENDATIONS ─────────── */}
      {(loading || recommendations.length > 0) && (
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-border/80">
          <div className="flex items-center justify-between mb-6 border-b border-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Compass className="size-4.5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Recommended For You
                </h2>
                <p className="text-xs text-muted-foreground">
                  Personalized picks tailored to your collector profile and interests
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/products?sort=latest")}
              className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
            >
              Explore all
              <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <AmazonProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {recommendations.slice(0, 8).map((product) => (
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
      )}

      {/* ─── 8. RECENTLY VIEWED ROW (AMAZON STYLE) ─────────────────── */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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
