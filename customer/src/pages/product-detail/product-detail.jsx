import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApi } from "@/core/contexts/api.context";
import { useEcom } from "@/core/contexts/ecom.context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Share2,
  ZoomIn,
  Package,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AmazonProductCard } from "@/modules/product/product.components";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { products, wishlist, cart } = api;
  const { recentlyViewed, addRecentlyViewed, getRecommendedFor } = useEcom();

  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [linkCopied, setLinkCopied] = useState(false);

  const imageContainerRef = useRef(null);

  // Get product from module
  const product = products.current;
  const storeLoading = products.loading;

  const wishlistItems = wishlist.list || [];
  const isWishlisted =
    Boolean(product?.is_in_wishlist) ||
    wishlistItems.some((p) => p._id === product?._id);

  const reviews = product?.reviews || [];

  // Star rating distribution for rating bar chart (must be declared BEFORE any early returns)
  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.round(r.rating || 0);
      if (star >= 1 && star <= 5) dist[star]++;
    });
    return dist;
  }, [reviews]);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setQuantity(1);
    setSelectedImage(0);
    products
      .getBySlug(slug)
      .then((data) => {
        if (data) {
          addRecentlyViewed(data);
        }
      })
      .catch(() => {
        toast.error("Product not found");
        navigate("/products");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Reset selected image when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
    }
  }, [product?._id]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (loading || storeLoading?.getOne) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Package className="size-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
          We couldn't find the product you're looking for. It may have been
          removed or the link might be incorrect.
        </p>
        <Button
          onClick={() => navigate("/products")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back to products
        </Button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];
  const price = Number(product.price || 0);
  const isOutOfStock = product.stock <= 0;
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  // Derived MRP for Amazon-style discount display (approx 20% higher)
  const mrp = Math.round(price * 1.25);
  const discountPercent =
    price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const isChoice =
    (Number(avgRating) >= 4.2 && reviews.length >= 2) || product.featured;

  // Related products from recently viewed (excluding current)
  const recentProducts = (recentlyViewed || [])
    .filter((p) => p._id !== product?._id)
    .slice(0, 4);

  // Recommended products
  const recommendedProducts = getRecommendedFor
    ? getRecommendedFor(product._id)?.slice(0, 4) || []
    : [];

  const handleAddToCart = () => {
    if (product) {
      cart.addToCart(product, quantity);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      cart.addToCart(product, quantity);
      navigate("/checkout");
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      wishlist.toggle(product, isWishlisted);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Torque Toyzz!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  };

  const handleImageZoom = (e) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > (product.stock || 10)) return product.stock || 10;
      return next;
    });
  };

  const handleRecommendedAddToCart = (p) => {
    cart.addToCart(p, 1);
    toast.success(`${p.name} added to cart`);
  };

  const handleRecommendedToggleWishlist = (p) => {
    const isWish =
      wishlistItems.some((w) => w._id === p._id) ||
      Boolean(p?.is_in_wishlist);
    wishlist.toggle(p, isWish);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Breadcrumb Bar ──────────────────────────────── */}
      <div className="border-b border-border/60 bg-card/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="no-underline text-muted-foreground hover:text-foreground text-xs">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/products" className="no-underline text-muted-foreground hover:text-foreground text-xs">Products</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {product.category?.name && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          to={`/products?category=${product.category?._id || ""}`}
                          className="no-underline text-muted-foreground hover:text-foreground text-xs"
                        >
                          {product.category.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 max-w-[180px] sm:max-w-xs text-xs font-medium">
                    {product.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Back to results link */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-7 hidden sm:inline-flex"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="size-3.5 mr-1" />
              Back to results
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Main Product Section ────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* ═══════════════════════════════════════════════
              LEFT: Image Gallery (Sticky)
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Main Image with Zoom */}
              <div
                ref={imageContainerRef}
                className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 dark:bg-muted/10 border border-border/60 flex items-center justify-center group cursor-crosshair"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleImageZoom}
              >
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className={cn(
                      "size-full object-contain p-6 transition-transform duration-200",
                      isZoomed && "scale-150"
                    )}
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          }
                        : undefined
                    }
                    draggable={false}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="size-12 opacity-30" />
                    <span className="text-xs">No image available</span>
                  </div>
                )}

                {/* Top-Left Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
                  {isChoice && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide shadow-sm uppercase">
                      Featured Pick
                    </span>
                  )}
                  {discountPercent > 15 && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold px-2 py-0.5"
                    >
                      {discountPercent}% OFF
                    </Badge>
                  )}
                </div>

                {/* Top-Right Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={handleToggleWishlist}
                          className="size-9 rounded-full bg-background/90 backdrop-blur-sm shadow-sm border border-border/80 flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95"
                        >
                          <Heart
                            className={cn(
                              "size-4 transition-colors",
                              isWishlisted
                                ? "fill-primary text-primary"
                                : "text-muted-foreground hover:text-primary"
                            )}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={handleShare}
                          className="size-9 rounded-full bg-background/90 backdrop-blur-sm shadow-sm border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-95"
                        >
                          {linkCopied ? (
                            <Check className="size-4 text-emerald-500" />
                          ) : (
                            <Share2 className="size-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Share product</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Zoom indicator */}
                <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <ZoomIn className="size-3" />
                  Hover to zoom
                </div>

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] text-muted-foreground font-medium">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "shrink-0 size-16 sm:size-[72px] rounded-lg overflow-hidden border-2 transition-all bg-muted/30 dark:bg-muted/10 p-1",
                        selectedImage === idx
                          ? "border-primary shadow-sm ring-1 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/30"
                      )}
                    >
                      <img
                        src={img}
                        alt=""
                        className="size-full object-contain"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              MIDDLE: Product Details
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-5">
            {/* Category */}
            {product.category?.name && (
              <Link
                to={`/products?category=${product.category?._id || ""}`}
                className="no-underline"
              >
                <Badge
                  variant="secondary"
                  className="text-[11px] font-medium bg-primary/8 text-primary border border-primary/15 hover:bg-primary/15 transition-colors cursor-pointer"
                >
                  {product.category.name}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Rating Bar */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5 bg-primary/10 px-2 py-0.5 rounded-md">
                    <span className="text-sm font-bold text-primary">
                      {avgRating}
                    </span>
                    <Star className="size-3.5 fill-primary text-primary" />
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-3.5",
                          i < Math.round(Number(avgRating))
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/20 fill-muted-foreground/5"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {reviews.length} {reviews.length === 1 ? "rating" : "ratings"} & reviews
                </span>
              </div>
            )}

            <Separator />

            {/* Price Block */}
            <div className="space-y-1.5">
              {discountPercent > 0 && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2 py-0.5"
                  >
                    {discountPercent}% off
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    Limited time deal
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                {mrp > price && (
                  <span className="text-base text-muted-foreground line-through">
                    M.R.P: ₹{mrp.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Inclusive of all taxes
              </p>
            </div>

            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <Badge variant="destructive" className="font-medium">
                  Out of stock
                </Badge>
              ) : product.stock < 10 ? (
                <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Only {product.stock} left in stock – order soon
                </p>
              ) : (
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  In stock
                </p>
              )}
            </div>

            <Separator />

            {/* Delivery & Services (Compact Badges) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Delivery & Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: Truck,
                    label: "Free Delivery",
                    desc: "On orders above ₹999",
                  },
                  {
                    icon: RotateCcw,
                    label: "7 Days Return",
                    desc: "Easy return policy",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Warranty",
                    desc: "Manufacturer warranty",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/60 bg-muted/30 dark:bg-muted/10"
                  >
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight line-clamp-1">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Highlights */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Product Highlights</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                {product.weight > 0 && (
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    Weight: {product.weight} kg
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  Code: {product.code}
                </li>
                {product.active && (
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Available for purchase
                  </li>
                )}
                {!isOutOfStock && (
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    Stock: {product.stock} units
                  </li>
                )}
              </ul>
            </div>

            {/* Description */}
            {product.description && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">About this item</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT: Buy Box (Sticky)
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <div className="border border-border/70 rounded-xl p-5 bg-card shadow-xs space-y-4">
                {/* Price in buy box */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    {mrp > price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-primary">
                      FREE delivery
                    </span>{" "}
                    on orders above ₹999
                  </p>
                </div>

                <Separator />

                {/* Stock in buy box */}
                <div>
                  {isOutOfStock ? (
                    <p className="text-destructive font-semibold text-sm">
                      Currently unavailable
                    </p>
                  ) : (
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                      In stock
                    </p>
                  )}
                </div>

                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Quantity
                    </label>
                    <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden w-fit">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="h-9 w-10 flex items-center justify-center text-sm font-semibold border-x border-border bg-muted/20">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= (product.stock || 10)}
                        className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  <Button
                    size="lg"
                    className="w-full rounded-full bg-primary hover:bg-primary/90 active:bg-primary/95 text-primary-foreground font-semibold text-sm shadow-sm border border-transparent transition-transform active:scale-[0.98] h-11"
                    disabled={isOutOfStock || !product.active}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="size-4 mr-2" />
                    Add to cart
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full font-semibold text-sm h-11 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all"
                    disabled={isOutOfStock || !product.active}
                    onClick={handleBuyNow}
                  >
                    Buy now
                  </Button>
                </div>

                <Separator />

                {/* Wishlist & Share */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs font-medium h-9 text-muted-foreground hover:text-primary"
                    onClick={handleToggleWishlist}
                  >
                    <Heart
                      className={cn(
                        "size-3.5 mr-1.5",
                        isWishlisted && "fill-primary text-primary"
                      )}
                    />
                    {isWishlisted ? "Wishlisted" : "Add to wishlist"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-medium h-9 text-muted-foreground hover:text-foreground"
                    onClick={handleShare}
                  >
                    {linkCopied ? (
                      <Check className="size-3.5 mr-1.5 text-emerald-500" />
                    ) : (
                      <Share2 className="size-3.5 mr-1.5" />
                    )}
                    Share
                  </Button>
                </div>

                {/* Secure transaction note */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                  <ShieldCheck className="size-3.5 text-muted-foreground/70 shrink-0" />
                  <span>Secure transaction · SSL Encrypted</span>
                </div>
              </div>

              {/* Mobile bottom sticky actions */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 flex gap-2.5 shadow-lg">
                <div className="flex flex-col justify-center min-w-0 mr-auto">
                  <span className="text-lg font-bold tracking-tight">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  {mrp > price && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      ₹{mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 size-10 rounded-full border-primary/30"
                  onClick={handleToggleWishlist}
                >
                  <Heart
                    className={cn(
                      "size-4",
                      isWishlisted
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </Button>
                <Button
                  className="flex-1 max-w-[200px] rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm h-10 shadow-sm"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="size-4 mr-1.5" />
                  Add to cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Reviews Section ────────────────────────────── */}
        {reviews.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/60">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Rating Summary */}
              <div className="lg:col-span-3">
                <h3 className="text-lg font-semibold mb-4">
                  Ratings & Reviews
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                      {avgRating}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-4",
                              i < Math.round(Number(avgRating))
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/20 fill-muted-foreground/5"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {reviews.length}{" "}
                        {reviews.length === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>

                  {/* Rating Distribution Bars */}
                  <div className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingDistribution[star];
                      const percent =
                        reviews.length > 0
                          ? (count / reviews.length) * 100
                          : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs w-8 text-right text-muted-foreground font-medium">
                            {star}
                            <Star className="size-2.5 inline ml-0.5 fill-amber-400 text-amber-400 -mt-0.5" />
                          </span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-6 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="lg:col-span-9 space-y-4">
                {reviews.slice(0, 6).map((review) => (
                  <div
                    key={review._id}
                    className="p-4 rounded-lg border border-border/60 bg-card/50 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-xs font-bold text-primary">
                          {review.rating}
                          <Star className="size-2.5 fill-primary text-primary" />
                        </div>
                        <span className="text-sm font-medium">
                          {review.user?.name || "Anonymous"}
                        </span>
                      </div>
                      {review.createdAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Recommended Products ──────────────────────── */}
        {recommendedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/60">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold tracking-tight">
                You might also like
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/products")}
              >
                View all
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {recommendedProducts.map((p) => (
                <AmazonProductCard
                  key={p._id}
                  product={p}
                  onAddToCart={handleRecommendedAddToCart}
                  onToggleWishlist={handleRecommendedToggleWishlist}
                  isWishlisted={
                    wishlistItems.some((w) => w._id === p._id) ||
                    Boolean(p?.is_in_wishlist)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* ─── Recently Viewed ───────────────────────────── */}
        {recentProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/60 pb-20 lg:pb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold tracking-tight">
                Recently viewed
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {recentProducts.map((p) => (
                <AmazonProductCard
                  key={p._id}
                  product={p}
                  onAddToCart={handleRecommendedAddToCart}
                  onToggleWishlist={handleRecommendedToggleWishlist}
                  isWishlisted={
                    wishlistItems.some((w) => w._id === p._id) ||
                    Boolean(p?.is_in_wishlist)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Enhanced Skeleton ─────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb skeleton */}
      <div className="border-b border-border/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Image */}
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="size-16 sm:size-[72px] rounded-lg shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-4 space-y-5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-4/5" />
              <Skeleton className="h-7 w-2/3" />
            </div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-px w-full" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Buy Box */}
          <div className="lg:col-span-3">
            <div className="border rounded-xl p-5 space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-9 w-28 rounded-lg" />
              <div className="space-y-2.5 pt-2">
                <Skeleton className="h-11 w-full rounded-full" />
                <Skeleton className="h-11 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
