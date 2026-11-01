import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Weight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveProductImage } from "@/modules/product/product.components";

// ─── Cart Progress Stepper (Torque Toyzz Vibe) ──────────────────────
export function CartStepper({ currentStep = 1 }) {
  const steps = [
    { number: 1, label: "Cart", sub: "Review Models" },
    { number: 2, label: "Shipping Address", sub: "Destination Info" },
    { number: 3, label: "Payment & Order", sub: "Confirmation" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-2">
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="hidden sm:block absolute left-[15%] right-[15%] top-4.5 h-1 bg-border rounded-full z-0" />
        
        {/* Active Fill Line */}
        <div
          className="hidden sm:block absolute left-[15%] top-4.5 h-1 bg-primary rounded-full z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 70}%` }}
        />

        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center gap-1.5 text-center">
              <div
                className={cn(
                  "size-9 sm:size-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 bg-background shadow-xs",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isActive && "border-primary text-primary ring-4 ring-primary/20 scale-105 font-extrabold",
                  !isActive && !isCompleted && "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-4.5 stroke-[2.5]" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs font-bold transition-colors",
                  isActive && "text-foreground font-extrabold",
                  isCompleted && "text-primary",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                {step.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Cart Item Card (Products & Orders Vibe) ─────────────────────────
export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
  isUpdating,
}) {
  const navigate = useNavigate();

  const getCleanProductId = (target) => {
    if (!target) return "";
    if (typeof target === "string") return target;
    if (typeof target.product === "string") return target.product;
    if (target.product && typeof target.product === "object") {
      return String(target.product._id || target.product.id || "");
    }
    return String(target._id || target.id || "");
  };

  const productId = getCleanProductId(item);
  const name = item.name || item.product?.name || "Precision Scale Model";
  const image = resolveProductImage(item.image || item.product?.images?.[0], productId);
  const price = Number(item.price ?? item.product?.price ?? 0);
  const quantity = Number(item.quantity || 1);
  const weight = Number(item.weight ?? item.product?.weight ?? 0);
  const lineTotal = price * quantity;

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/50 transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center group">
      {/* Thumbnail Image */}
      <div
        className="size-22 sm:size-26 rounded-xl bg-background border border-border/80 group-hover:border-primary p-2 shrink-0 overflow-hidden cursor-pointer flex items-center justify-center relative transition-all shadow-2xs"
        onClick={() => navigate(productId ? `/products/${productId}` : "#")}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ShoppingBag className="size-8 text-muted-foreground/40" />
        )}
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0 space-y-1.5 w-full">
        <div>
          <Link
            to={productId ? `/products/${productId}` : "#"}
            className="font-bold text-sm sm:text-base line-clamp-1 text-foreground hover:text-primary transition-colors block leading-snug"
          >
            {name}
          </Link>
          <div className="flex items-center justify-between sm:justify-start gap-2.5 text-xs text-muted-foreground font-medium pt-0.5 flex-wrap">
            <span>Unit: ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className="sm:hidden font-bold text-foreground">
              Total: ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            {weight > 0 && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Weight className="size-3 text-primary" />
                  {weight} kg / unit
                </span>
              </>
            )}
          </div>
        </div>

        {/* Collector Guarantee Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="inline-flex items-center gap-1 text-primary font-semibold text-[11px]">
            <ShieldCheck className="size-3.5" /> Certified Precision Collectible
          </span>
          <span className="text-muted-foreground text-[11px]">•</span>
          <span className="text-[11px] text-muted-foreground">
            Quality Checked
          </span>
        </div>

        {/* Actions Bar: Stepper & Buttons */}
        <div className="flex items-center justify-between pt-2.5 gap-4 flex-wrap">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-1 border border-border/80 rounded-xl p-0.5 bg-background shadow-2xs">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => onUpdateQuantity(productId, quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
              title="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-8 text-center text-xs font-bold text-foreground select-none">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => onUpdateQuantity(productId, quantity + 1)}
              disabled={isUpdating}
              title="Increase quantity"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          {/* Quick Actions (Move to Wishlist & Remove) */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveToWishlist(item)}
                    className="h-8 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1.5 px-2.5 rounded-xl cursor-pointer"
                  >
                    <Heart className="size-3.5 text-primary" />
                    <span className="hidden sm:inline">Save for later</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to Wishlist</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(productId)}
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove from cart</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Item Line Total (Right on desktop) */}
      <div className="text-right shrink-0 hidden sm:block self-center pl-5 border-l border-border/70 min-w-[120px]">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold">
          Line Total
        </span>
        <span className="text-lg font-black tracking-tight text-foreground">
          ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

// ─── Order Summary Box (Products & Orders Vibe) ──────────────────────
export function CartOrderSummary({
  pricing,
  itemCount,
  onProceedToCheckout,
}) {
  const { subtotal = 0, tax = 0, total_weight = 0, shipping_cost = 0, total = 0, is_free_delivery } = pricing || {};
  const grandTotal = total > 0 ? total : subtotal + shipping_cost + tax;

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs sticky top-24 space-y-0">
      {/* Header Strip */}
      <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex items-center justify-between">
        <h3 className="font-bold text-base tracking-tight text-foreground">
          Order Summary
        </h3>
        <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Badge>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Free Shipping Perk Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5 text-xs">
          <Truck className="size-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-foreground">
              Express Shipping
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Precision models are secured in shock-proof bubble wrapping for safe doorstep delivery across India.
            </p>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items Subtotal:</span>
            <span className="font-medium text-foreground">
              ₹{Number(subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Estimated Shipping:</span>
            {shipping_cost > 0 ? (
              <span className="font-medium text-foreground">
                ₹{Number(shipping_cost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            ) : is_free_delivery ? (
              <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                FREE Delivery
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">
                Calculated at checkout
              </span>
            )}
          </div>

          {tax > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated GST (18%):</span>
              <span className="font-medium text-foreground">
                ₹{Number(tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {total_weight > 0 && (
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              <span className="flex items-center gap-1">
                <Weight className="size-3 text-primary" /> Consignment Weight:
              </span>
              <span className="font-medium text-foreground">{total_weight.toFixed(2)} kg</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Grand Total */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-bold text-base tracking-tight text-foreground block">
              Estimated Total
            </span>
            <span className="text-[11px] text-muted-foreground">Includes all applicable taxes</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-primary">
            ₹{Number(grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Proceed to Checkout CTA */}
        <Button
          size="lg"
          onClick={onProceedToCheckout}
          className="w-full h-11.5 font-bold gap-2 text-sm rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer transition-all"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="size-4" />
        </Button>

        {/* Garage Trust Guarantees */}
        <div className="pt-2 grid grid-cols-1 gap-2.5 text-xs text-muted-foreground border-t border-border/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span>100% Genuine Certified Scale Collectibles</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-primary shrink-0" />
            <span>Fast Shipping Across India</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="size-4 text-primary shrink-0" />
            <span>7-Day Return / Replacement Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Empty State Component (Matching Orders Page Empty State) ──
export function CartEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-card p-12 text-center space-y-4 my-4">
      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xs">
        <ShoppingBag className="size-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground tracking-tight">
          Your Cart is Empty
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          You haven't added any diecast scale models or RC cars to your cart yet. Browse our products to get started.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
        <Button
          size="sm"
          onClick={() => navigate("/products")}
          className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-xs px-5 h-9 cursor-pointer gap-1.5"
        >
          <ShoppingBag className="size-3.5" />
          <span>Explore Catalog</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/wishlist")}
          className="rounded-xl text-xs font-medium px-5 h-9 hover:border-primary hover:text-primary cursor-pointer gap-1.5"
        >
          <Heart className="size-3.5 text-primary" />
          <span>View Wishlist</span>
        </Button>
      </div>
    </div>
  );
}

// ─── Cart Skeleton Loader ──────────────────────────────────────────
export function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-4 items-start">
      <div className="lg:col-span-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border/80 bg-card p-5 flex gap-4 items-center">
            <Skeleton className="size-24 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-5 w-1/2 rounded" />
              <Skeleton className="h-4 w-1/4 rounded" />
              <div className="pt-2 flex justify-between items-center">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-4">
        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-1/2 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
