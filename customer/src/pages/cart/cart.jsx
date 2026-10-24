'use client';

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApi } from "@/core/contexts/api.context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import {
  CartStepper,
  CartItemCard,
  CartOrderSummary,
  CartEmptyState,
  CartSkeleton,
} from "@/modules/cart/cart.components";

export default function Cart() {
  const navigate = useNavigate();
  const api = useApi();
  const { items = [], updateQuantity, removeFromCart, pricing, fetchCart, clearCart, loading } = api.cart;
  const { addProduct: addToWishlist } = api.wishlist;

  const [isUpdatingId, setIsUpdatingId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      setIsUpdatingId(productId);
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        toast.success("Item removed from cart");
      } else {
        await updateQuantity(productId, newQuantity);
      }
    } catch {
      toast.error("Failed to update cart quantity");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setIsUpdatingId(productId);
      await removeFromCart(productId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleMoveToWishlist = async (item) => {
    const productId = item.product || item.id || item._id;
    try {
      setIsUpdatingId(productId);
      await addToWishlist(productId);
      await removeFromCart(productId);
      toast.success(`Saved "${item.name}" to your wishlist`);
    } catch {
      toast.error("Could not save item to wishlist");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setIsClearing(true);
      await clearCart();
      toast.success("Your cart has been cleared");
    } catch {
      toast.error("Failed to clear cart");
    } finally {
      setIsClearing(false);
    }
  };

  const isInitialLoading = loading && items.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ─── Checkout Stepper Progress ─── */}
        <CartStepper currentStep={1} />

        {/* ─── Page Header Strip ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Shopping Cart
            </h1>
            {items.length > 0 && (
              <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
                {items.length} {items.length === 1 ? "model" : "models"}
              </Badge>
            )}
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/products")}
                className="h-8.5 rounded-xl text-xs gap-1.5 font-medium hover:border-primary hover:text-primary cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Continue Shopping</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isClearing}
                    className="h-8.5 rounded-xl text-xs gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Clear Cart</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-border bg-popover shadow-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                      <Trash2 className="size-5" />
                      Clear all items from your cart?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                      This will remove all precision scale models from your shopping cart. You can always add them back later from the catalog.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="pt-2">
                    <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearCart}
                      className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs"
                    >
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* ─── Cart Content Grid ─── */}
        {isInitialLoading ? (
          <CartSkeleton />
        ) : items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Item List (Left 8 Columns) */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => {
                const productId = item.product || item.id || item._id;
                return (
                  <CartItemCard
                    key={productId}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                    onMoveToWishlist={handleMoveToWishlist}
                    isUpdating={isUpdatingId === productId}
                  />
                );
              })}
            </div>

            {/* Order Summary Sidebar (Right 4 Columns) */}
            <div className="lg:col-span-4">
              <CartOrderSummary
                pricing={pricing}
                itemCount={items.reduce((sum, i) => sum + (i.quantity || 1), 0)}
                onProceedToCheckout={() => navigate("/checkout")}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
