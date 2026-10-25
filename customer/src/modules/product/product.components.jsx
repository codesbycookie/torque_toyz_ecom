import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Heart,
  Star,
  ArrowRight,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/core/contexts/api.context";
import { toast } from "sonner";


// ─── Vertical Product List Card (Amazon style) ──────────────
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


// ─── High-Res Automotive Fallback Image Helper ──────────────
const FALLBACK_CARS = [
  "/cars/gt3_rs.jpg",
  "/cars/redbull_f1.jpg",
  "/cars/rx7_lbwk.jpg",
  "/cars/bmw_m4_gt3.jpg",
  "/cars/daytona_sp3.jpg",
  "/cars/ferrari_499p.jpg",
  "/cars/r34_gtr.jpg",
  "/cars/shelby_cobra.jpg",
];

export const resolveProductImage = (img, seedKey = 0) => {
  if (
    !img ||
    typeof img !== "string" ||
    img.includes("placehold.co") ||
    img.includes("text=Product")
  ) {
    const idx =
      typeof seedKey === "string"
        ? Math.abs(
            seedKey.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
          ) % FALLBACK_CARS.length
        : Math.abs(Number(seedKey || 0)) % FALLBACK_CARS.length;
    return FALLBACK_CARS[idx];
  }
  return img;
};

// ─── Add to Cart / Quantity Stepper Control (- [count] +) ─────
export function CartQuantityControl({
  product,
  onAddToCart,
  size = "sm", // "sm" | "md" | "lg"
  className = "",
}) {
  const { cart } = useApi();
  const [isUpdating, setIsUpdating] = useState(false);

  const productId = String(product?._id || product?.id || "");
  const cartItem = cart?.items?.find((item) => {
    const itemProdId = String(
      item?.product?._id || item?.product?.id || item?.product || item?._id || ""
    );
    return itemProdId === productId;
  });
  const count = cartItem?.quantity || 0;
  const isOutOfStock = product?.stock !== undefined && product.stock <= 0;

  const handleAdd = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (isOutOfStock || !product?.active || isUpdating) return;
    try {
      setIsUpdating(true);
      await cart.addToCart(product, 1);
      toast.success(`${product.name} added to cart`);
      if (onAddToCart) {
        try {
          await onAddToCart(product);
        } catch {}
      }
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (isUpdating) return;
    if (product?.stock && count >= product.stock) {
      toast.error(`Only ${product.stock} units available in stock`);
      return;
    }
    try {
      setIsUpdating(true);
      await cart.updateQuantity(product, count + 1);
    } catch {
      toast.error("Failed to update cart");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      if (count <= 1) {
        await cart.removeFromCart(product);
        toast.success(`Removed ${product.name} from cart`);
      } else {
        await cart.updateQuantity(product, count - 1);
      }
    } catch {
      toast.error("Failed to update cart");
    } finally {
      setIsUpdating(false);
    }
  };

  // Size mapping
  const sizeConfig = {
    sm: {
      container: "h-8 sm:h-9 text-xs sm:text-sm px-1 min-w-[110px]",
      button: "size-6 sm:size-7",
      icon: "size-3 sm:size-3.5",
      addBtn: "h-8 sm:h-9 text-xs sm:text-sm rounded-full",
      addIcon: "size-3.5 mr-1 sm:mr-1.5",
    },
    md: {
      container: "h-11 text-sm px-1.5 min-w-[130px]",
      button: "size-8",
      icon: "size-4",
      addBtn: "h-11 text-sm rounded-xl font-bold",
      addIcon: "size-4.5 mr-2",
    },
    lg: {
      container: "h-12 text-base px-2 min-w-[150px]",
      button: "size-9",
      icon: "size-4.5",
      addBtn: "h-12 text-base rounded-xl font-bold",
      addIcon: "size-5 mr-2",
    },
  }[size] || {
    container: "h-8 sm:h-9 text-xs sm:text-sm px-1 min-w-[110px]",
    button: "size-6 sm:size-7",
    icon: "size-3 sm:size-3.5",
    addBtn: "h-8 sm:h-9 text-xs sm:text-sm rounded-full",
    addIcon: "size-3.5 mr-1 sm:mr-1.5",
  };

  // State 1: When NOT in cart (count === 0)
  if (count <= 0) {
    return (
      <Button
        type="button"
        disabled={isOutOfStock || !product?.active || isUpdating}
        className={cn(
          "cart-quantity-control bg-primary hover:bg-primary/90 active:bg-primary/95 text-primary-foreground font-semibold shadow-xs border border-transparent transition-all active:scale-[0.98] cursor-pointer",
          sizeConfig.addBtn,
          className
        )}
        onClick={handleAdd}
      >
        {isUpdating ? (
          <Loader2 className={cn(sizeConfig.addIcon, "animate-spin")} />
        ) : (
          <ShoppingCart className={sizeConfig.addIcon} />
        )}
        {isOutOfStock ? "Out of stock" : isUpdating ? "Adding..." : "Add to cart"}
      </Button>
    );
  }

  // State 2: When IN cart (count > 0) -> turns into - [count] +
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={cn(
        "cart-quantity-control flex items-center justify-between rounded-full border-2 border-primary bg-primary/10 dark:bg-primary/20 text-primary transition-all duration-200 select-none shadow-2xs",
        sizeConfig.container,
        className
      )}
    >
      {/* Minus Button */}
      <button
        type="button"
        disabled={isUpdating}
        aria-label="Decrease quantity"
        title="Decrease quantity"
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary hover:text-primary-foreground text-primary active:scale-90 transition-all cursor-pointer disabled:opacity-50 shrink-0",
          sizeConfig.button
        )}
        onClick={handleDecrement}
      >
        <Minus className={cn(sizeConfig.icon, "stroke-[3]")} />
      </button>

      {/* Count Display */}
      <div className="flex items-center justify-center px-1.5 flex-1">
        {isUpdating ? (
          <Loader2 className={cn(sizeConfig.icon, "animate-spin text-primary")} />
        ) : (
          <span className="font-extrabold text-foreground tabular-nums select-none">
            {count}
          </span>
        )}
      </div>

      {/* Plus Button */}
      <button
        type="button"
        disabled={isUpdating || Boolean(product?.stock && count >= product.stock)}
        aria-label="Increase quantity"
        title={product?.stock && count >= product.stock ? "Maximum stock reached" : "Increase quantity"}
        className={cn(
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-90 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0",
          sizeConfig.button
        )}
        onClick={handleIncrement}
      >
        <Plus className={cn(sizeConfig.icon, "stroke-[3]")} />
      </button>
    </div>
  );
}

// ─── Vertical Product List Card (shadcn style) ──────────────
export function ProductListCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) {
  const navigate = useNavigate();
  const firstImage = resolveProductImage(product.images?.[0], product._id || product.slug);
  const price = Number(product.price || 0);
  const isOutOfStock = product.stock <= 0;

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      ).toFixed(1)
      : null;

  const isWish = isWishlisted || Boolean(product?.is_in_wishlist);

  const handleCardClick = (e) => {
    if (e?.target?.closest?.("button") || e?.target?.closest?.(".cart-quantity-control")) {
      return;
    }
    navigate(`/products/${product.slug || product._id}`);
  };

  return (
    <Card
      className="overflow-hidden border-x-0 border-t-0 rounded-none shadow-none hover:bg-muted/40 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-4 sm:gap-6">
          {/* Left - Image */}
          <div className="shrink-0 w-32 sm:w-40 md:w-44">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
              {firstImage ? (
                <img
                  src={firstImage}
                  alt={product.name}
                  className="size-full object-contain p-2"
                  loading="lazy"
                />
              ) : (
                <span className="text-sm text-muted-foreground">No image</span>
              )}
            </div>
          </div>

          {/* Right - Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              {/* Category */}
              {product.category?.name && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {product.category.name}
                </Badge>
              )}

              {/* Title */}
              <h3 className="font-semibold text-[15px] sm:text-base leading-snug line-clamp-2 hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              {avgRating && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{avgRating}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3.5",
                            i < Math.round(Number(avgRating))
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({reviews.length} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="pt-1">
                <span className="text-xl font-semibold tracking-tight">
                  ₹{price.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Stock status */}
              <div className="text-sm">
                {isOutOfStock ? (
                  <Badge variant="destructive" className="font-normal">
                    Out of stock
                  </Badge>
                ) : product.stock < 10 ? (
                  <span className="text-amber-600 font-medium">
                    Only {product.stock} left
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium">In stock</span>
                )}
              </div>

              {/* Weight */}
              {product.weight > 0 && (
                <p className="text-xs text-muted-foreground">
                  Weight: {product.weight} kg
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <CartQuantityControl
                product={product}
                onAddToCart={onAddToCart}
                size="sm"
                className="w-auto min-w-[125px]"
              />

              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist?.(product);
                      }}
                    >
                      <Heart
                        className={cn(
                          "size-4",
                          isWish && "fill-rose-500 text-rose-500"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isWish ? "Remove from wishlist" : "Add to wishlist"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
// ─── Amazon-Style Product Grid Card ─────────────────────────
export function AmazonProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) {
  const navigate = useNavigate();
  const firstImage = resolveProductImage(product.images?.[0], product._id || product.slug);
  const price = Number(product.price || 0);
  const isOutOfStock = product.stock <= 0;
  const isWish = isWishlisted || Boolean(product?.is_in_wishlist);

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  // Derived MRP for Amazon-style discount display (approx 20% higher)
  const mrp = Math.round(price * 1.25);
  const discountPercent = price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const isChoice = (Number(avgRating) >= 4.2 && reviews.length >= 2) || product.featured;

  const handleCardClick = (e) => {
    if (e?.target?.closest?.("button") || e?.target?.closest?.(".cart-quantity-control")) {
      return;
    }
    navigate(`/products/${product.slug || product._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-row sm:flex-col justify-between h-auto sm:h-full bg-card hover:bg-card/95 border border-border/70 hover:border-primary/50 rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* Media Area (Horizontal thumbnail on mobile, Top square on desktop) */}
      <div className="relative w-32 xs:w-36 sm:w-full shrink-0 aspect-square overflow-hidden bg-muted/20 dark:bg-muted/10 p-2 sm:p-4 flex items-center justify-center border-r sm:border-r-0 sm:border-b border-border/40">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
            No image available
          </div>
        )}

        {/* Badges on Top Left */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 items-start z-1">
          {isChoice && (
            <span className="bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm tracking-wide shadow-xs uppercase">
              Featured Pick
            </span>
          )}
          {isOutOfStock ? (
            <Badge variant="destructive" className="text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0">
              Out of stock
            </Badge>
          ) : product.stock > 0 && product.stock <= 5 ? (
            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0">
              Only {product.stock} left
            </Badge>
          ) : discountPercent > 15 ? (
            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0">
              {discountPercent}% OFF
            </Badge>
          ) : null}
        </div>

        {/* Wishlist Button on Top Right */}
        <button
          type="button"
          aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 size-7 sm:size-8 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm shadow-xs border border-border/80 flex items-center justify-center text-muted-foreground hover:text-primary transition-transform hover:scale-110 active:scale-95 z-2"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product);
          }}
        >
          <Heart
            className={cn(
              "size-3.5 sm:size-4 transition-colors",
              isWish ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"
            )}
          />
        </button>
      </div>

      {/* Product Details Area (Right on mobile, Bottom on desktop) */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2 min-w-0">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Category */}
          {product.category?.name && (
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-muted-foreground line-clamp-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-xs sm:text-[15px] leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs pt-0.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-2.5 sm:size-3.5",
                    avgRating && i < Math.round(Number(avgRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30 fill-muted-foreground/10"
                  )}
                />
              ))}
            </div>
            {avgRating ? (
              <span className="text-muted-foreground font-medium text-[10px] sm:text-[11px]">
                {avgRating} ({reviews.length})
              </span>
            ) : (
              <span className="text-muted-foreground/60 text-[10px] sm:text-[11px]">(New)</span>
            )}
          </div>

          {/* Price & MRP Block */}
          <div className="pt-0.5 sm:pt-1 space-y-0.5">
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-foreground">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {mrp > price && (
                <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-[11px] sm:text-xs font-semibold text-primary">
                  ({discountPercent}% off)
                </span>
              )}
            </div>

            {/* Delivery Promise */}
            <p className="text-[10px] sm:text-[11px] text-muted-foreground">
              <span className="font-semibold text-primary">FREE delivery</span>{" "}
              available
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1.5 sm:pt-2">
          <CartQuantityControl
            product={product}
            onAddToCart={onAddToCart}
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Amazon-Style Product Grid ──────────────────────────────
export function AmazonProductGrid({
  products = [],
  loading,
  onAddToCart,
  onToggleWishlist,
  wishlistedIds = [],
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <AmazonProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-xl bg-card/50">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShoppingCart className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No products found</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          Try clearing some filters or searching with different terms to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      {products.map((product) => (
        <AmazonProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistedIds.includes(product._id) || Boolean(product?.is_in_wishlist)}
        />
      ))}
    </div>
  );
}

export const ProductGrid = AmazonProductGrid;
export const ProductCard = AmazonProductCard;

// ─── Skeletons ──────────────────────────────────────────────
export function AmazonProductCardSkeleton() {
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden bg-card flex flex-row sm:flex-col justify-between h-auto sm:h-full p-0">
      <Skeleton className="w-32 xs:w-36 sm:w-full aspect-square shrink-0 rounded-none" />
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5 flex-1 min-w-0">
        <Skeleton className="h-2.5 sm:h-3 w-1/3" />
        <Skeleton className="h-3.5 sm:h-4 w-4/5" />
        <Skeleton className="h-2.5 sm:h-3 w-1/2" />
        <Skeleton className="h-4 sm:h-5 w-24 pt-0.5" />
        <Skeleton className="h-8 sm:h-9 w-full rounded-full mt-2 sm:mt-3" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return <AmazonProductCardSkeleton />;
}

// ─── Featured Section (for Home) ────────────────────────────
export function FeaturedProducts({
  title = "Featured Products",
  products = [],
  loading,
  onAddToCart,
  onToggleWishlist,
  wishlistedIds = [],
  viewAllLink = "/products",
}) {
  const navigate = useNavigate();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Button variant="ghost" onClick={() => navigate(viewAllLink)}>
          View all
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>

      <ProductGrid
        products={products}
        loading={loading}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wishlistedIds={wishlistedIds}
      />
    </section>
  );
}