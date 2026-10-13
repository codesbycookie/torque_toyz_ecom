import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProductActions({
  disabled,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
}) {
  return (
    <div className="flex gap-3">
      <Button
        size="lg"
        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
        disabled={disabled}
        onClick={onAddToCart}
      >
        <ShoppingCart className="size-5 mr-2" />
        Add to cart
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={onToggleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={cn("size-5", isWishlisted && "fill-rose-500 text-rose-500")}
        />
      </Button>
    </div>
  );
}