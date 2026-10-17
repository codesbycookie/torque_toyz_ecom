import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stepClass =
  "grid size-11 place-items-center text-muted-foreground transition-transform transition-colors hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-40";

export default function ProductActions({
  quantity,
  max,
  disabled,
  isInCart,
  isWishlisted,
  onQuantityChange,
  onAddToCart,
  onGoToCart,
  onToggleWishlist,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
      <div className="order-1 inline-flex h-12 shrink-0 items-center rounded-lg border bg-background">
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
        disabled={disabled && !isInCart}
        onClick={isInCart ? onGoToCart : onAddToCart}
        className="order-3 h-12 w-full min-w-0 text-base transition-transform active:scale-[0.98] lg:order-2 lg:flex-1"
      >
        <ShoppingCart className="mr-2 size-5" />
        {isInCart ? "Go to cart" : "Add to cart"}
      </Button>

      <Button
        size="lg"
        variant="outline"
        onClick={onToggleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isWishlisted}
        className="order-2 ml-auto h-12 w-12 shrink-0 px-0 transition-transform active:scale-90 lg:order-3 lg:ml-0"
      >
        <Heart
          className={cn("size-5", isWishlisted && "fill-primary text-primary")}
        />
      </Button>
    </div>
  );
}