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
import { ShoppingCart, Heart, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Product Card ───────────────────────────────────────────
export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) {
  const firstImage = product.images?.[0];
  const price = Number(product.price || 0).toFixed(2);
  const isOutOfStock = product.stock <= 0;

  return (
    <Card className="group overflow-hidden border-border/60 transition-all hover:shadow-md">
      {/* Image */}
      <Link
        to={`/product/${product.slug || product._id}`}
        className="block relative aspect-square overflow-hidden bg-muted"
      >
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {!product.active && <Badge variant="secondary">Inactive</Badge>}
          {isOutOfStock && <Badge variant="destructive">Out of stock</Badge>}
        </div>

        {/* Quick actions (appear on hover) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="size-8 rounded-full shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist?.(product);
            }}
          >
            <Heart
              className={cn(
                "size-4",
                isWishlisted && "fill-rose-500 text-rose-500"
              )}
            />
          </Button>
        </div>
      </Link>

      <CardHeader className="p-4 pb-2 space-y-1">
        <Link
          to={`/product/${product.slug || product._id}`}
          className="font-medium leading-tight line-clamp-2 hover:underline"
        >
          {product.name}
        </Link>

        {product.category?.name && (
          <p className="text-xs text-muted-foreground">
            {product.category.name}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-semibold tracking-tight">₹{price}</span>

          {product.reviews?.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>
                {(
                  product.reviews.reduce((s, r) => s + (r.rating || 0), 0) /
                  product.reviews.length
                ).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gap-2"
          disabled={isOutOfStock || !product.active}
          onClick={() => onAddToCart?.(product)}
        >
          <ShoppingCart className="size-4" />
          {isOutOfStock ? "Out of stock" : "Add to cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Product Grid ───────────────────────────────────────────
export function ProductGrid({
  products = [],
  loading,
  onAddToCart,
  onToggleWishlist,
  wishlistedIds = [],
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistedIds.includes(product._id)}
        />
      ))}
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardHeader className="p-4 pb-2 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-6 w-20" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
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