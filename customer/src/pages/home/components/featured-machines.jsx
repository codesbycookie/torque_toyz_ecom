import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FeaturedMachines({
  products = [],
  loading = false,
  onAddToCart,
  onToggleWishlist,
  wishlistedIds = [],
}) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // Fallback demo items in case backend has no products yet
  const fallbackProducts = [
    {
      _id: "demo-1",
      name: "RC Drift Sports Car 1:16",
      slug: "rc-drift-sports-car-1-16",
      price: 1299,
      original_price: 1499,
      stock: 14,
      rating: 4.8,
      reviewCount: 24,
      discount: "20% OFF",
      images: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "demo-2",
      name: "Off-Road Monster Truck 4WD",
      slug: "off-road-monster-truck-4wd",
      price: 1799,
      original_price: 1999,
      stock: 8,
      rating: 4.9,
      reviewCount: 42,
      discount: "20% OFF",
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "demo-3",
      name: "Lamborghini-style RC Sports Car",
      slug: "lamborghini-style-rc-sports-car",
      price: 2199,
      original_price: 2499,
      stock: 4,
      rating: 4.7,
      reviewCount: 19,
      discount: "20% OFF",
      images: [
        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "demo-4",
      name: "High Speed Racing RC Car 35km/h",
      slug: "high-speed-racing-rc-car-35kmh",
      price: 3199,
      original_price: 3499,
      stock: 12,
      rating: 4.9,
      reviewCount: 53,
      discount: "15% OFF",
      images: [
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "demo-5",
      name: "Die-Cast Supercar 1:18 Collector Edition",
      slug: "die-cast-supercar-1-18-collector-edition",
      price: 1899,
      original_price: 2199,
      stock: 15,
      rating: 4.8,
      reviewCount: 31,
      discount: "20% OFF",
      images: [
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
      ],
    },
  ];

  const displayList = products && products.length > 0 ? products : fallbackProducts;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section id="featured-machines" className="py-8 sm:py-12 md:py-16 bg-muted/20 border-y border-border/60 scroll-mt-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-primary text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="size-3.5 fill-primary" />
              <span>TOP OF THE LINE RC FLEET</span>
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-foreground">
              FEATURED RACE MACHINES
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Calibrated for competitive race runs, weekend bashing, and collector showcases.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="size-8 sm:size-9 rounded-md border border-border/80 bg-card hover:bg-muted hover:border-primary/50 text-foreground flex items-center justify-center transition-colors shadow-xs"
              aria-label="Previous machines"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="size-8 sm:size-9 rounded-md border border-border/80 bg-card hover:bg-muted hover:border-primary/50 text-foreground flex items-center justify-center transition-colors shadow-xs"
              aria-label="Next machines"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Carousel / Product Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayList.map((product) => {
            const isWish =
              wishlistedIds.includes(product._id) || Boolean(product?.is_in_wishlist);
            const image =
              product.images?.[0] ||
              "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80";
            const price = Number(product.price || 0);
            const originalPrice =
              product.original_price ||
              product.compare_at_price ||
              Math.round(price * 1.2) ||
              price + 300;
            const stock = product.stock ?? 10;
            const isOutOfStock = stock <= 0;
            const isLowStock = stock > 0 && stock <= 5;
            const rating =
              product.rating ||
              (product.reviews?.length > 0
                ? (
                    product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                    product.reviews.length
                  ).toFixed(1)
                : "4.8");
            const reviewsCount =
              product.reviewCount || product.reviews?.length || 24;

            return (
              <div
                key={product._id}
                className="group w-[250px] sm:w-[270px] shrink-0 rounded-xl overflow-hidden border border-border/80 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between snap-start"
              >
                {/* Image & Action Badges */}
                <div className="relative aspect-[4/3] bg-neutral-100/70 p-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={image}
                    alt={product.name}
                    className="size-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Discount Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-primary text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                      {product.discount || "20% OFF"}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist?.(product);
                    }}
                    className="absolute top-2.5 right-2.5 size-7 rounded-full bg-card/90 backdrop-blur-xs border border-border/60 hover:border-primary/50 flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={cn(
                        "size-3.5 transition-colors",
                        isWish ? "fill-primary text-primary" : "text-muted-foreground"
                      )}
                    />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Stock & Rating Row */}
                    <div className="flex items-center justify-between text-[11px]">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                          <span className="size-1.5 rounded-full bg-destructive" />
                          Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <span className="size-1.5 rounded-full bg-emerald-600" />
                          In Stock
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-muted-foreground font-medium">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span className="text-foreground font-semibold">{rating}</span>
                        <span>({reviewsCount})</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3
                      onClick={() =>
                        navigate(`/products/${product.slug || product._id}`)
                      }
                      className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug cursor-pointer pt-0.5"
                    >
                      {product.name}
                    </h3>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base sm:text-lg font-black text-foreground">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      {originalPrice > price && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => onAddToCart?.(product)}
                      disabled={isOutOfStock}
                      className="w-full h-8 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 hover:bg-primary text-neutral-800 hover:text-white border border-border/80 transition-colors shadow-none rounded-md"
                    >
                      <ShoppingCart className="size-3.5 mr-1.5" />
                      <span>{isOutOfStock ? "Out of Stock" : "ADD TO CART"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

