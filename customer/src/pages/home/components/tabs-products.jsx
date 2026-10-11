import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TabsProducts({
  products = [],
  onAddToCart,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bestsellers");
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Fallback demo items if backend has no seeded products
  const fallbackBestsellers = [
    {
      _id: "bs-1",
      name: "Apex Trail Hunter 4x4",
      slug: "apex-trail-hunter-4x4",
      categoryName: "ROCK CRAWLER",
      scale: "SCALE 1:14",
      price: 4499,
      original_price: 5499,
      rating: 4.9,
      reviewCount: 128,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "bs-2",
      name: "Apex Rallycross QR-4",
      slug: "apex-rallycross-qr-4",
      categoryName: "RALLY SPEC",
      scale: "SCALE 1:16",
      price: 3799,
      original_price: 4599,
      rating: 4.8,
      reviewCount: 96,
      stock: 9,
      images: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "bs-3",
      name: "Torquetron V8 Truck",
      slug: "torquetron-v8-truck",
      categoryName: "MONSTER BASHER",
      scale: "DESERT 4x4",
      price: 5299,
      original_price: 6199,
      rating: 4.9,
      reviewCount: 144,
      stock: 6,
      images: [
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "bs-4",
      name: "Vintage 1968 Classic Die-Cast",
      slug: "vintage-1968-classic-die-cast",
      categoryName: "DIE-CAST METAL",
      scale: "COLLECTOR METAL",
      price: 2899,
      original_price: 3399,
      rating: 4.9,
      reviewCount: 201,
      stock: 18,
      images: [
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
      ],
    },
  ];

  const fallbackNewArrivals = [
    {
      _id: "na-1",
      name: "Apex Nitro Drift Speeder",
      slug: "apex-nitro-drift-speeder",
      categoryName: "DRIFT SPEC",
      scale: "SCALE 1:10",
      price: 5999,
      original_price: 6999,
      rating: 4.9,
      reviewCount: 18,
      stock: 12,
      images: [
        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "na-2",
      name: "Torque Dune Phantom 4x4",
      slug: "torque-dune-phantom-4x4",
      categoryName: "DUNE BUGGY",
      scale: "DESERT SPEC",
      price: 4899,
      original_price: 5799,
      rating: 4.8,
      reviewCount: 22,
      stock: 10,
      images: [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "na-3",
      name: "Overdrive Brushless Truggy",
      slug: "overdrive-brushless-truggy",
      categoryName: "TRUGGY RACER",
      scale: "SCALE 1:12",
      price: 6499,
      original_price: 7499,
      rating: 5.0,
      reviewCount: 34,
      stock: 7,
      images: [
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      _id: "na-4",
      name: "Heritage 1970 GT Die-Cast",
      slug: "heritage-1970-gt-die-cast",
      categoryName: "SCALE MASTER",
      scale: "COLLECTOR 1:18",
      price: 3499,
      original_price: 3999,
      rating: 4.9,
      reviewCount: 45,
      stock: 14,
      images: [
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
      ],
    },
  ];

  // If real API products are available:
  const hasRealProducts = products && products.length > 0;
  const currentList = hasRealProducts
    ? activeTab === "bestsellers"
      ? products.slice(0, 8)
      : products.slice(4, 12).length > 0
        ? products.slice(4, 12)
        : products.slice(0, 8)
    : activeTab === "bestsellers"
      ? fallbackBestsellers
      : fallbackNewArrivals;

  return (
    <section id="best-sellers" className="py-8 sm:py-12 md:py-16 bg-background scroll-mt-16">
      <div className="container mx-auto px-4">
        {/* Header with interactive tabs & scroll controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 border-b border-border/80 pb-4">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("bestsellers")}
              className={`flex items-center gap-2 text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors pb-1 border-b-2 -mb-[18px] ${
                activeTab === "bestsellers"
                  ? "text-foreground border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <span>BEST SELLERS</span>
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                HOT
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("newarrivals")}
              className={`flex items-center gap-2 text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors pb-1 border-b-2 -mb-[18px] ${
                activeTab === "newarrivals"
                  ? "text-foreground border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <span>NEW ARRIVALS</span>
              <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                FRESH
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium hidden md:block">
              Fastest downforce pack
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="size-8 rounded-md border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-colors shadow-xs"
                aria-label="Previous products"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="size-8 rounded-md border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-colors shadow-xs"
                aria-label="Next products"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Product Shelf */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {currentList.map((product, idx) => {
            const image =
              product.images?.[0] ||
              "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80";
            const price = Number(product.price || 0);
            const originalPrice =
              product.original_price ||
              product.compare_at_price ||
              Math.round(price * 1.2) ||
              price + 500;
            const categoryTag =
              product.categoryName ||
              product.category?.name?.toUpperCase() ||
              (idx % 2 === 0 ? "ROCK CRAWLER" : "RALLY SPEC");
            const scaleTag =
              product.scale ||
              `SCALE 1:${14 + (idx % 3) * 2}`;
            const rating =
              product.rating ||
              (product.reviews?.length > 0
                ? (
                    product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                    product.reviews.length
                  ).toFixed(1)
                : "4.9");
            const reviewsCount =
              product.reviewCount || product.reviews?.length || (100 + idx * 25);

            return (
              <div
                key={product._id || idx}
                className="w-[240px] sm:w-[260px] md:w-[275px] shrink-0 snap-start group flex flex-col justify-between rounded-xl overflow-hidden border border-border/80 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                {/* Image & Scale Pill */}
                <div className="relative aspect-[4/3] bg-neutral-100/70 p-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={image}
                    alt={product.name}
                    className="size-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {scaleTag}
                    </span>
                  </div>
                </div>

                {/* Info & Buy */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-primary tracking-wider uppercase">
                        {categoryTag}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground font-medium">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span className="text-foreground font-semibold">{rating}</span>
                        <span>({reviewsCount})</span>
                      </div>
                    </div>

                    <h3
                      onClick={() =>
                        navigate(`/products/${product.slug || product._id}`)
                      }
                      className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1 cursor-pointer pt-0.5"
                    >
                      {product.name}
                    </h3>
                  </div>

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
                      className="w-full h-8 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 hover:bg-primary text-neutral-800 hover:text-white border border-border/80 transition-colors shadow-none rounded-md"
                    >
                      <ShoppingCart className="size-3.5 mr-1.5" />
                      <span>ADD TO CART</span>
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

