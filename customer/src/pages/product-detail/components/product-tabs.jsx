import { CheckCircle2, Hash, Package, Tag, Weight } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductSpecCard from "./product-spec-card";
import ProductReviewItem from "./product-review-item";
import { ProductStars } from "./product-rating-badge";

export default function ProductTabs({
  product,
  reviews = [],
  rating,
  stock,
  activeTab,
  onTabChange,
}) {
  const tabs = [
    ...(product.description ? [{ id: "description", label: "Description" }] : []),
    { id: "details", label: "Product details" },
    {
      id: "reviews",
      label: `Reviews${reviews.length ? ` (${reviews.length})` : ""}`,
    },
  ];
  const selected = tabs.some((t) => t.id === activeTab) ? activeTab : tabs[0].id;

  const specs = [
    { icon: Hash, label: "Product code", value: product.code },
    { icon: Tag, label: "Category", value: product.category?.name },
    {
      icon: Weight,
      label: "Weight",
      value: Number(product.weight) > 0 ? `${product.weight} kg` : null,
    },
    {
      icon: Package,
      label: "Stock",
      value: stock > 0 ? `${stock} units` : "Out of stock",
    },
    {
      icon: CheckCircle2,
      label: "Availability",
      value: product.active ? "Available for purchase" : "Unavailable",
    },
  ].filter((spec) => spec.value);

  return (
    <section id="product-tabs" className="mt-12 scroll-mt-6 sm:mt-16">
      <div
        role="tablist"
        aria-label="Product information"
        className="flex gap-6 overflow-x-auto border-b"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "-mb-px shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors",
              selected === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`panel-${selected}`}
        role="tabpanel"
        aria-labelledby={`tab-${selected}`}
        className="pt-6"
      >
        {selected === "description" && (
          <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {product.description}
          </p>
        )}

        {selected === "details" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specs.map((spec) => (
              <ProductSpecCard key={spec.label} {...spec} />
            ))}
          </div>
        )}

        {selected === "reviews" &&
          (reviews.length ? (
            <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
              <div>
                <p className="text-4xl font-bold tracking-tight">
                  {rating.toFixed(1)}
                </p>
                <ProductStars value={rating} className="mt-2" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Based on {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
              <div className="divide-y">
                {reviews.map((review) => (
                  <ProductReviewItem key={review._id} review={review} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              There are no reviews for this product yet.
            </p>
          ))}
      </div>
    </section>
  );
}