import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  Hash,
  ListChecks,
  MessageSquare,
  Package,
  Weight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProductSpecCard from "./product-spec-card";
import ProductReviewItem from "./product-review-item";

export default function ProductTabs({ product, reviews = [] }) {
  const tabs = [
    product.description && {
      id: "description",
      label: "Description",
      icon: FileText,
    },
    { id: "specifications", label: "Specifications", icon: ListChecks },
    reviews.length > 0 && {
      id: "reviews",
      label: `Reviews (${reviews.length})`,
      icon: MessageSquare,
    },
  ].filter(Boolean);

  const [active, setActive] = useState(tabs[0].id);

  return (
    <section className="space-y-5">
      <div className="flex gap-1 overflow-x-auto rounded-xl border bg-background p-1.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={cn(
              "flex items-center gap-2 shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active === id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {active === "description" && (
        <div className="rounded-xl border bg-background p-6">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {active === "specifications" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {product.weight > 0 && (
            <ProductSpecCard
              icon={Weight}
              label="Weight"
              value={`${product.weight} kg`}
            />
          )}
          <ProductSpecCard icon={Hash} label="Product code" value={product.code} />
          <ProductSpecCard
            icon={Package}
            label="Stock"
            value={product.stock > 0 ? `${product.stock} units` : "Out of stock"}
          />
          {product.active && (
            <ProductSpecCard
              icon={CheckCircle2}
              label="Availability"
              value="Available for purchase"
            />
          )}
        </div>
      )}

      {active === "reviews" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.slice(0, 5).map((review) => (
            <ProductReviewItem key={review._id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}