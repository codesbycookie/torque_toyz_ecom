import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  Sparkles,
  Tag,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Cart Progress Stepper Header ──────────────────────────────────
export function CartStepper({ currentStep = 1 }) {
  const steps = [
    { number: 1, label: "Shopping Cart" },
    { number: 2, label: "Shipping Details" },
    { number: 3, label: "Payment & Order" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-muted z-0" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "size-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 bg-background",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isActive && "border-primary text-primary ring-4 ring-primary/20 scale-105 font-bold",
                  !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? <CheckCircle2 className="size-5" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors hidden sm:block",
                  isActive && "text-foreground font-semibold",
                  isCompleted && "text-primary",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Cart Item Card Component ──────────────────────────────────────
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
  const productPath = item.slug || item.product?.slug || productId;
  const name = item.name || item.product?.name || "Product";
  const image = item.image || item.product?.images?.[0];
  const price = Number(item.price ?? item.product?.price ?? 0);
  const quantity = Number(item.quantity || 1);
  const weight = Number(item.weight ?? item.product?.weight ?? 0);
  const lineTotal = price * quantity;

  return (
    <Card className="overflow-hidden border group transition-all duration-200 hover:shadow-sm">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
        {/* Thumbnail Image */}
        <div
          className="size-24 sm:size-28 rounded-xl bg-muted/40 border shrink-0 overflow-hidden cursor-pointer flex items-center justify-center p-2 relative"
          onClick={() => navigate(`/products/${productPath}`)}
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
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/products/${productPath}`}
                className="font-semibold text-base line-clamp-1 hover:text-primary transition-colors block leading-snug"
              >
                {name}
              </Link>
              <p className="text-xs text-muted-foreground font-medium pt-0.5">
                Unit Price: ₹{price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Badges / Weight info */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {weight > 0 && (
              <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                Weight: {(weight * quantity).toFixed(2)} kg
              </Badge>
            )}
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              In Stock & Ready to Ship
            </span>
          </div>

          {/* Actions Bar (Mobile & Desktop) */}
          <div className="flex items-center justify-between pt-3 gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-background shadow-2xs">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                onClick={() => onUpdateQuantity(productId, quantity - 1)}
                disabled={quantity <= 1 || isUpdating}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-8 text-center text-xs font-semibold select-none">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                onClick={() => onUpdateQuantity(productId, quantity + 1)}
                disabled={isUpdating}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>

            {/* Quick Actions (Move to Wishlist & Remove) */}
            <div className="flex items-center gap-1.5">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveToWishlist(item)}
                      className="h-8 text-xs font-medium text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 gap-1.5 px-2.5"
                    >
                      <Heart className="size-3.5" />
                      <span className="hidden sm:inline">Save for later</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save to Wishlist</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(productId)}
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove item</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Item Total Price */}
        <div className="text-right shrink-0 hidden sm:block self-center pl-4 border-l">
          <span className="text-xs text-muted-foreground block font-medium">Subtotal</span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            ₹{lineTotal.toLocaleString("en-IN")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Order Summary Box ─────────────────────────────────────────────
export function CartOrderSummary({
  pricing,
  itemCount,
  onProceedToCheckout,
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  appliedPromo,
}) {
  const { subtotal = 0, tax = 0, total_weight = 0, shipping_cost = 0, total = 0 } = pricing || {};
  const grandTotal = total > 0 ? total : subtotal + shipping_cost + tax;

  return (
    <Card className="sticky top-24 border shadow-sm overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="font-bold text-lg tracking-tight">Order Summary</h2>
          <Badge variant="secondary" className="font-semibold text-xs">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Badge>
        </div>

        {/* Promo Code Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Tag className="size-3.5 text-primary" /> Promo / Coupon Code
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code (e.g. TORQUE10)"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              className="h-9 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onApplyPromo}
              className="h-9 text-xs font-semibold px-3 shrink-0"
            >
              Apply
            </Button>
          </div>
          {appliedPromo && (
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <Sparkles className="size-3" /> Coupon "{appliedPromo}" applied!
            </p>
          )}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items Subtotal</span>
            <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">GST / Tax</span>
            <span className="font-medium">₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Shipping</span>
            <span className="font-medium">
              {shipping_cost > 0 ? `₹${shipping_cost.toLocaleString("en-IN")}` : "Calculated at checkout"}
            </span>
          </div>

          {total_weight > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Total Shipment Weight</span>
              <span>{total_weight.toFixed(2)} kg</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Grand Total */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-bold text-lg tracking-tight block">Total Amount</span>
            <span className="text-[11px] text-muted-foreground">Includes taxes & duties</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-primary">
            ₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Checkout Button */}
        <Button
          size="lg"
          onClick={onProceedToCheckout}
          className="w-full font-bold gap-2 text-base py-6 shadow-md hover:shadow-lg transition-all"
        >
          Proceed to Checkout
          <ArrowRight className="size-5" />
        </Button>

        {/* Value Props & Guarantees */}
        <div className="pt-2 grid grid-cols-1 gap-2.5 text-xs text-muted-foreground border-t">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>100% Secure Checkout & Buyer Protection</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck className="size-4 text-primary shrink-0" />
            <span>Fast Express Dispatch Across India</span>
          </div>
          <div className="flex items-center gap-2.5">
            <RotateCcw className="size-4 text-amber-500 shrink-0" />
            <span>Easy 7-Day Hassle-Free Returns</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Cart Empty State Component ────────────────────────────────────
export function CartEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed bg-card/40 my-8">
      <div className="relative mb-6">
        <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ShoppingBag className="size-12 stroke-[1.5]" />
        </div>
        <span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-md">
          <Sparkles className="size-4" />
        </span>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">Your Cart is Empty</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        Looks like you haven't added any toys or collectibles to your cart yet. Explore our awesome catalog to find great deals!
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          onClick={() => navigate("/products")}
          className="gap-2 font-semibold px-8 shadow-md"
        >
          <ShoppingBag className="size-5" />
          Explore Store
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate("/wishlist")}
          className="gap-2 font-medium px-6"
        >
          <Heart className="size-5 text-rose-500" />
          View Wishlist
        </Button>
      </div>
    </div>
  );
}

// ─── Cart Skeleton Loader ──────────────────────────────────────────
export function CartSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8 my-8">
      <div className="md:col-span-2 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-4">
              <Skeleton className="size-24 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <div className="pt-4 flex justify-between">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </Card>
      </div>
    </div>
  );
}
