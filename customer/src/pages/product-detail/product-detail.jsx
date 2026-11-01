import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApi } from "@/core/contexts/api.context";
import { useEcom } from "@/core/contexts/ecom.context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBreadcrumb } from "@/core/contexts/breadcrumb.context";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CartQuantityControl } from "@/modules/product/product.components";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { products, wishlist, cart, settings } = api;
  const {
    recentlyViewed,
    addRecentlyViewed,
    getRecommendedFor,
  } = useEcom();
  const { setCustomBreadcrumbs } = useBreadcrumb();

  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get product from module
  const product = products.current;
  const storeLoading = products.loading;

  const wishlistItems = wishlist.list || [];
  const isWishlisted = Boolean(product?.is_in_wishlist) || wishlistItems.some((p) => p._id === product?._id);

  // Sync with global breadcrumb strip
  useEffect(() => {
    if (product) {
      const items = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
      ];
      if (product.category?.name) {
        items.push({
          label: product.category.name,
          href: `/products?category=${product.category._id || product.category.id}`,
        });
      }
      items.push({ label: product.name });
      setCustomBreadcrumbs(items);
    }
  }, [product, setCustomBreadcrumbs]);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    products
      .getBySlug(slug)
      .then((data) => {
        if (data) {
          addRecentlyViewed(data);
        }
      })
      .catch(() => {
        toast.error("Product not found");

      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Reset selected image when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      // addRecentlyViewed(product);
    }
  }, [product?._id]);

  if (loading || storeLoading?.getOne) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">Product not found</p>
        <Button className="mt-4" onClick={() => navigate("/products")}>
          Back to products
        </Button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];
  const ui = product.ui || {};
  const price = Number(ui.actual_price || product.price || 0);
  const slashPrice = Number(ui.slash_price || 0);
  const hasDiscount = slashPrice > price;
  const discountPercent = hasDiscount ? Math.round(((slashPrice - price) / slashPrice) * 100) : 0;
  const isTrending = Boolean(ui.is_trending);
  const customBadges = Array.isArray(ui.badges) ? ui.badges.filter(Boolean) : [];
  const isOutOfStock = product.stock <= 0;
  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      ).toFixed(1)
      : null;

  const handleAddToCart = () => {
    if (product) {
      cart.addToCart(product, 1);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      wishlist.toggle(product, isWishlisted);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─── LEFT: Images (Sticky) ─────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Main Image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-muted border flex items-center justify-center">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="size-full object-contain p-4"
                  />
                ) : (
                  <span className="text-muted-foreground">No image</span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "shrink-0 size-16 sm:size-20 rounded-lg overflow-hidden border-2 transition-all",
                        selectedImage === idx
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/30"
                      )}
                    >
                      <img
                        src={img}
                        alt=""
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Mobile actions (shown only on small screens) */}
              <div className="flex gap-2.5 lg:hidden pt-1">
                <CartQuantityControl
                  product={product}
                  size="md"
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-xl size-11 shrink-0 cursor-pointer"
                  onClick={handleToggleWishlist}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={cn(
                      "size-5 transition-colors",
                      isWishlisted ? "fill-primary text-primary" : "text-muted-foreground"
                    )}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Product Info (Scrollable) ─────────────── */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            {/* Title & Promotional Badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {product.category?.name && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {product.category.name}
                  </Badge>
                )}
                {isTrending && (
                  <Badge variant="default" className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold py-0">
                    Trending
                  </Badge>
                )}
                {customBadges.map((badge, idx) => (
                  <Badge key={idx} variant="default" className="text-xs bg-primary text-primary-foreground font-bold py-0">
                    {badge}
                  </Badge>
                ))}
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {avgRating && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 font-medium">
                  {avgRating}
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {reviews.length} ratings & reviews
                </span>
              </div>
            )}

            <Separator />

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  ₹{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/60">
                      ₹{Number(slashPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {discountPercent}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Inclusive of all taxes
              </p>
            </div>

            {/* Stock */}
            <div>
              {isOutOfStock ? (
                <Badge variant="destructive">Out of stock</Badge>
              ) : product.stock < 10 ? (
                <p className="text-amber-600 font-medium text-sm">
                  Only {product.stock} left in stock – order soon
                </p>
              ) : (
                <p className="text-emerald-600 font-medium text-sm">In stock</p>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex gap-3">
              <CartQuantityControl
                product={product}
                size="lg"
                className="flex-1 max-w-xs"
              />
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl size-12 shrink-0 cursor-pointer"
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={cn(
                    "size-5 transition-colors",
                    isWishlisted ? "fill-primary text-primary" : "text-muted-foreground"
                  )}
                />
              </Button>
            </div>

            <Separator />

            {/* Highlights */}
            <div className="space-y-3">
              <h3 className="font-semibold">Highlights</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                {product.weight > 0 && (
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Weight: {product.weight} kg
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Code: {product.code}
                </li>
                {product.active && (
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Available for purchase
                  </li>
                )}
              </ul>
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <div className="space-y-3">
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Delivery & Services */}
            <div className="space-y-4">
              <h3 className="font-semibold">Delivery & Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Truck className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {settings?.values?.free_delivery ? "Free Delivery" : "Express Delivery"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {settings?.values?.free_delivery ? "On all orders nationwide" : "Doorstep courier logistics"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <RotateCcw className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">7 Days Replacement</p>
                    <p className="text-xs text-muted-foreground">
                      Easy return policy
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Warranty</p>
                    <p className="text-xs text-muted-foreground">
                      Manufacturer warranty
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section (simple) */}
            {reviews.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    Ratings & Reviews ({reviews.length})
                  </h3>
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review._id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1">
                            {review.rating}
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                          </Badge>
                          <span className="text-sm font-medium">
                            {review.user?.name || "Anonymous"}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-16 sm:size-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}