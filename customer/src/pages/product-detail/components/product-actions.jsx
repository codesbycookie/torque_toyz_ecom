import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stepClass =
  "grid size-11 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

export default function ProductActions({
  quantity,
  max,
  disabled,
  isWishlisted,
  onQuantityChange,
  onAddToCart,
  onToggleWishlist,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex h-12 shrink-0 items-center rounded-lg border bg-background">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={disabled || quantity <= 1}
          onClick={() => onQuantityChange(quantity - 1)}
          className={stepClass}
        >
          <Minus className="size-4" />
        </button>
        <span
          className="min-w-8 text-center text-sm font-semibold"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={disabled || quantity >= max}
          onClick={() => onQuantityChange(quantity + 1)}
          className={stepClass}
        >
          <Plus className="size-4" />
        </button>
      </div>

      <Button
        size="lg"
        disabled={disabled}
        onClick={onAddToCart}
        className="h-12 min-w-0 flex-1 text-base"
      >
        <ShoppingCart className="mr-2 size-5" />
        Add to cart
      </Button>

      <Button
        size="lg"
        variant="outline"
        onClick={onToggleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isWishlisted}
        className="h-12 w-12 shrink-0 px-0"
      >
        <Heart
          className={cn("size-5", isWishlisted && "fill-primary text-primary")}
        />
      </Button>
    </div>
  );
}