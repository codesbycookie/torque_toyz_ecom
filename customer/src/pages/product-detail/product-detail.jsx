import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/core/contexts/api.context";
import { useAuth } from "@/core/contexts/auth.context";

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const { products, wishlist, cart } = useApi();
  const getProductBySlug = products.getBySlug;
  const [loadedSlug, setLoadedSlug] = useState(null);
  const [loadedProduct, setLoadedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
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

  if (loadedSlug !== slug) {
    return <ProductDetailSkeleton />;
  }

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
  const imageIndex = Math.min(selectedImage, Math.max(images.length - 1, 0));
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const rating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
        reviews.length
      : null;
  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const quantity = Math.min(requestedQuantity, Math.max(stock, 1));
  const isWishlisted =
    Boolean(product.is_in_wishlist) ||
    (wishlist.list || []).some((item) => item._id === product._id);

  const handleAddToCart = async () => {
    if (!authenticated) {
      toast.info("Please sign in to add items to your cart");
      navigate("/login");
      return;
    }

    try {
      await cart.addToCart(product, quantity);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Could not add this product to your cart. Please try again.");
    }
  };

  const handleToggleWishlist = () => {
    if (!authenticated) {
      toast.info("Please sign in to use your wishlist");
      navigate("/login");
      return;
    }

    wishlist.toggle(product, isWishlisted);
  };

  const tabs = [
    ...(product.description ? [{ id: "description", label: "Description" }] : []),
    { id: "details", label: "Product details" },
    { id: "reviews", label: `Reviews${reviews.length ? ` (${reviews.length})` : ""}` },
  ];
  const selectedTab = tabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : tabs[0].id;

  return (
    <main className="min-h-screen bg-[#faf8f6] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/products" className="transition-colors hover:text-foreground">
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

        <section className="grid items-start gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div className="min-w-0">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              {images[imageIndex] ? (
                <img
                  src={images[imageIndex]}
                  alt={product.name}
                  className="size-full object-contain p-5 sm:p-8"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Package className="size-12" />
                  <span>No product images available</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={imageIndex === index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-[4/3] overflow-hidden rounded-xl border-2 bg-white p-1 transition-colors ${
                      imageIndex === index
                        ? "border-[#c81e32]"
                        : "border-transparent hover:border-black/15"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="size-full object-contain"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              {product.category?.name ? (
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bd1e32]">
                  {product.category.name}
                </p>
              ) : (
                <span />
              )}
              {product.code && (
                <p className="text-xs text-muted-foreground">
                  Code: {product.code}
                </p>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#24211f] sm:text-4xl">
              {product.name}
            </h1>

            {rating !== null && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <div
                  className="flex items-center gap-0.5 text-amber-500"
                  aria-label={`Rated ${rating.toFixed(1)} out of 5`}
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`size-4 ${
                        index < Math.round(rating)
                          ? "fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{rating.toFixed(1)}</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="text-muted-foreground underline-offset-4 hover:underline"
                >
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </button>
              </div>
            )}

            <div className="mt-6 rounded-xl bg-[#faf8f6] p-5">
              <p className="text-3xl font-bold tracking-tight text-[#bd1e32]">
                {formatPrice(product.price)}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span
                  className={`size-2.5 rounded-full ${
                    isOutOfStock ? "bg-gray-400" : "bg-emerald-600"
                  }`}
                />
                <span className={isOutOfStock ? "text-muted-foreground" : "text-emerald-700"}>
                  {isOutOfStock ? "Out of stock" : `${stock} available`}
                </span>
              </div>
            </div>

            {product.description && (
              <p className="mt-5 line-clamp-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex h-12 items-center rounded-lg border border-black/10 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setRequestedQuantity((value) => Math.max(1, value - 1))
                  }
                  className="grid size-11 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={isOutOfStock || quantity >= stock}
                  onClick={() =>
                    setRequestedQuantity((value) => Math.min(stock, value + 1))
                  }
                  className="grid size-11 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <Button
                size="lg"
                disabled={isOutOfStock || !product.active}
                onClick={handleAddToCart}
                className="h-12 flex-1 bg-[#bd1e32] text-white hover:bg-[#a7192b] sm:flex-none sm:px-8"
              >
                <ShoppingCart className="mr-2 size-4" />
                Add to cart
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="h-12 w-12 border-black/10"
              >
                <Heart
                  className={`size-5 ${
                    isWishlisted ? "fill-[#bd1e32] text-[#bd1e32]" : ""
                  }`}
                />
              </Button>
            </div>

            {!product.active && (
              <p className="mt-3 text-sm text-muted-foreground">
                This product is currently unavailable.
              </p>
            )}
          </div>
        </section>

        <section className="mt-12 sm:mt-16">
          <div
            role="tablist"
            aria-label="Product information"
            className="flex gap-2 overflow-x-auto rounded-xl border border-black/5 bg-white p-2"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selectedTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? "bg-[#bd1e32] text-white"
                    : "text-muted-foreground hover:bg-[#faf8f6] hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            id={`panel-${selectedTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${selectedTab}`}
            className="mt-4 min-h-40 rounded-2xl border border-black/5 bg-white p-5 sm:p-7"
          >
            {selectedTab === "description" && (
              <div className="max-w-4xl">
                <h2 className="text-lg font-semibold">About this product</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            {selectedTab === "details" && (
              <div className="max-w-3xl divide-y divide-black/5">
                {[
                  ["Product code", product.code],
                  ["Category", product.category?.name],
                  [
                    "Weight",
                    Number(product.weight) > 0 ? `${product.weight} kg` : null,
                  ],
                  ["Stock", isOutOfStock ? "Out of stock" : `${stock} available`],
                  ["Availability", product.active ? "Available" : "Unavailable"],
                ]
                  .filter(([, value]) => value !== undefined && value !== null && value !== "")
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="flex flex-wrap justify-between gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
              </div>
            )}

            {selectedTab === "reviews" && (
              <div id="product-reviews">
                <h2 className="text-lg font-semibold">Customer reviews</h2>
                {reviews.length ? (
                  <div className="mt-5 divide-y divide-black/5">
                    {reviews.map((review) => (
                      <article key={review._id} className="py-5 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {review.user?.name || "Anonymous"}
                            </p>
                            {review.createdAt && (
                              <time
                                dateTime={review.createdAt}
                                className="mt-1 block text-xs text-muted-foreground"
                              >
                                {new Date(review.createdAt).toLocaleDateString()}
                              </time>
                            )}
                          </div>
                          <div
                            className="flex items-center gap-1 text-amber-500"
                            aria-label={`${review.rating} out of 5 stars`}
                          >
                            <Star className="size-4 fill-current" />
                            <span className="text-sm font-medium text-foreground">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    There are no reviews for this product yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ProductDetailSkeleton() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="space-y-4">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-5 rounded-2xl border bg-white p-6">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-12 w-full" />
      </div>
    </main>
  );
}
