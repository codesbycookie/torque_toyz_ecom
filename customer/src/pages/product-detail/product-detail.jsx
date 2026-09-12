import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/core/contexts/api.context";
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

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products } = useApi();

  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get product from store
  const product = products.useStore((s) => s.current);
  const storeLoading = products.useStore((s) => s.loading);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    products
      .getBySlug(slug)
      .catch(() => {
        toast.error("Product not found");
        navigate("/products");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImage(0);
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
  const price = Number(product.price || 0);
  const isOutOfStock = product.stock <= 0;
  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  const handleAddToCart = () => {
    console.log("Add to cart:", product.name);
    toast.success("Added to cart");
  };

  const handleToggleWishlist = () => {
    console.log("Toggle wishlist:", product.name);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-[200px] sm:max-w-xs">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

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
              <div className="flex gap-3 lg:hidden">
                <Button
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="size-4 mr-2" />
                  Add to cart
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleToggleWishlist}
                >
                  <Heart className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Product Info (Scrollable) ─────────────── */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold leading-snug">
                {product.name}
              </h1>

              {product.category?.name && (
                <p className="text-sm text-muted-foreground mt-1">
                  {product.category.name}
                </p>
              )}
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
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight">
                  ₹{price.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
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
              <Button
                size="lg"
                className="flex-1 max-w-xs bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                disabled={isOutOfStock || !product.active}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="size-5 mr-2" />
                Add to cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
              >
                <Heart className="size-5" />
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
                    <p className="text-sm font-medium">Free Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      On orders above ₹999
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