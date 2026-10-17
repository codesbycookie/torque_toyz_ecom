import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Hash,
  Package,
  Scale,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApi } from "@/core/contexts/api.context";
import { useAuth } from "@/core/contexts/auth.context";
import { useEcom } from "@/core/contexts/ecom.context";
import { ProductGrid } from "@/modules/product/product.components";
import ProductActions from "./components/product-actions";
import ProductDetailSkeleton from "./components/product-detail-skeleton";
import ProductGallery from "./components/product-gallery";
import ProductRatingBadge from "./components/product-rating-badge";
import ProductStockStatus from "./components/product-stock-status";
import ProductTabs from "./components/product-tabs";
import {
  addProductToCart,
  formatProductPrice,
  getProductQuantity,
  getProductRating,
  isProductWishlisted,
  showProductReviews,
  toggleProductWishlist,
} from "./utils/product-detail.utils";

const crumbClass =
  "text-muted-foreground transition-colors hover:text-foreground hover:no-underline";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const { products, wishlist, cart } = useApi();
  const { recommendations, getRecommendations } = useEcom();
  const getProductBySlug = products.getBySlug;
  const [loadedSlug, setLoadedSlug] = useState(null);
  const [loadedProduct, setLoadedProduct] = useState(null);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const product =
    loadedProduct &&
    (loadedProduct.slug === slug || String(loadedProduct._id) === slug)
      ? loadedProduct
      : null;

  useEffect(() => {
    let isCurrentRequest = true;

    getProductBySlug(slug)
      .then((data) => {
        if (isCurrentRequest) setLoadedProduct(data);
      })
      .catch(() => {
        if (isCurrentRequest) {
          toast.error("Product not found");
          navigate("/products");
        }
      })
      .finally(() => {
        if (isCurrentRequest) setLoadedSlug(slug);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [slug, navigate, getProductBySlug]);

  useEffect(() => {
    if (product?._id) {
      getRecommendations({ productId: product._id, limit: 4 });
    }
  }, [product?._id, getRecommendations]);

  if (loadedSlug !== slug) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-5 text-center">
        <Package className="mb-4 size-10 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">
          This product may have been removed or is no longer available.
        </p>
        <Button className="mt-6" onClick={() => navigate("/products")}>
          <ArrowLeft className="mr-2 size-4" />
          Browse products
        </Button>
      </main>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const rating = getProductRating(reviews);
  const stock = Number(product.stock || 0);
  const isUnavailable = stock <= 0 || !product.active;
  const quantity = getProductQuantity(requestedQuantity, stock);
  const wishlistItems = wishlist.list || [];
  const isWishlisted = isProductWishlisted(product, wishlistItems);
  const relatedProducts = recommendations.filter(
    (item) => String(item._id) !== String(product._id),
  );

  const handleAddToCart = (item = product, count = quantity) =>
    addProductToCart({
      authenticated,
      navigate,
      cart,
      product: item,
      quantity: count,
    });

  const handleToggleWishlist = (item = product) =>
    toggleProductWishlist({
      authenticated,
      navigate,
      wishlist,
      product: item,
      isWishlisted: isProductWishlisted(item, wishlistItems),
    });

  return (
    <main className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link to="/" className={crumbClass}>
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/products" className={crumbClass}>
            Products
          </Link>
          {product.category?.name && (
            <>
              <span aria-hidden="true">/</span>
              <span>{product.category.name}</span>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="max-w-[16rem] truncate text-foreground">
            {product.name}
          </span>
        </nav>

        <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-8">
          <div className="space-y-5">
            <ProductGallery
              key={product._id}
              images={images}
              name={product.name}
            />

            <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-4">
              {product.category?.name && (
                <div className="flex min-w-0 items-center gap-2.5">
                  <Tag className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      Category
                    </p>
                    <p className="truncate text-sm font-medium">
                      {product.category.name}
                    </p>
                  </div>
                </div>
              )}
              {product.code && (
                <div className="flex min-w-0 items-center gap-2.5">
                  <Hash className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      Product code
                    </p>
                    <p className="truncate text-sm font-medium">
                      {product.code}
                    </p>
                  </div>
                </div>
              )}
              {Number(product.weight) > 0 && (
                <div className="flex min-w-0 items-center gap-2.5">
                  <Scale className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Weight</p>
                    <p className="truncate text-sm font-medium">
                      {product.weight} kg
                    </p>
                  </div>
                </div>
              )}
              <div className="flex min-w-0 items-center gap-2.5">
                <Package className="size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">
                    Availability
                  </p>
                  <p className="truncate text-sm font-medium">
                    {stock > 0 && product.active
                      ? `${stock} in stock`
                      : "Unavailable"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 sm:p-7 lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-4">
              {product.category?.name ? (
                <span className="torque-badge">{product.category.name}</span>
              ) : (
                <span />
              )}
              {product.code && (
                <p className="text-xs text-muted-foreground">
                  Code: {product.code}
                </p>
              )}
            </div>

            <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              {rating !== null ? (
                <ProductRatingBadge value={rating} />
              ) : (
                <span className="text-muted-foreground">No reviews yet</span>
              )}
              <button
                type="button"
                onClick={() => showProductReviews(setActiveTab)}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </button>
            </div>

            {product.description && (
              <p className="mt-5 line-clamp-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
            )}

            <div className="torque-top-accent mt-6 rounded-xl border bg-background p-4 sm:p-5">
              <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Price
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    {formatProductPrice(product.price)}
                  </p>
                </div>
                <ProductStockStatus stock={stock} active={product.active} />
              </div>

              <div className="mt-5">
                <ProductActions
                  quantity={quantity}
                  max={stock}
                  disabled={isUnavailable}
                  isWishlisted={isWishlisted}
                  onQuantityChange={(nextQuantity) =>
                    setRequestedQuantity(
                      getProductQuantity(nextQuantity, stock),
                    )
                  }
                  onAddToCart={() => handleAddToCart()}
                  onToggleWishlist={() => handleToggleWishlist()}
                />
              </div>

              {isUnavailable && (
                <p className="mt-3 text-sm text-muted-foreground">
                  This product cannot be added to your cart right now.
                </p>
              )}
            </div>
          </div>
        </section>

        <ProductTabs
          product={product}
          reviews={reviews}
          rating={rating}
          stock={stock}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {relatedProducts.length > 0 && (
          <section className="mt-14 space-y-6 border-t pt-8 sm:mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Picked for you
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Similar products
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/products")}
                className="gap-2"
              >
                Browse all products
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <ProductGrid
              products={relatedProducts}
              onAddToCart={(item) => handleAddToCart(item, 1)}
              onToggleWishlist={handleToggleWishlist}
              wishlistedIds={wishlistItems.map((item) => item._id)}
            />
          </section>
        )}
      </div>
    </main>
  );
}