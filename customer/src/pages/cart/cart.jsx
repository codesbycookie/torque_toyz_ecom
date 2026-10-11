'use client';

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApi } from "@/core/contexts/api.context";
import { useAuth } from "@/core/contexts/auth.context";
import { Button } from "@/components/ui/button";
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
  const { authenticated } = useAuth();
  const api = useApi();
  const { items = [], updateQuantity, removeFromCart, pricing, fetchCart, clearCart, loading } = api.cart;
  const { addProduct: addToWishlist } = api.wishlist;

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [isUpdatingId, setIsUpdatingId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (authenticated) {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

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
    if (!authenticated) {
      toast.info("Please sign in to use your wishlist");
      navigate("/login");
      return;
    }

    const productId = item.product || item.id || item._id;
    try {
      setIsUpdatingId(productId);
      await addToWishlist(productId);
      await removeFromCart(productId);
      toast.success(`Saved "${item.name}" to wishlist`);
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

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === "TORQUE10") {
      setAppliedPromo("TORQUE10");
      toast.success("Coupon code TORQUE10 applied successfully!");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const isInitialLoading = loading && items.length === 0;

  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-[85vh] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg rounded-2xl border border-dashed bg-card/40 px-6 py-12 text-center">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            You haven't signed in yet. Please log in to view your cart.
          </p>
          <Button onClick={() => navigate("/login")}>Log in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh]">
      {/* Checkout Stepper Progress */}
      <CartStepper currentStep={1} />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length > 0
              ? `You have ${items.length} ${items.length === 1 ? "item" : "items"} in your cart`
              : "Your cart is currently empty"}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/products")}
              className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Continue Shopping
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isClearing}
                  className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all items from your shopping cart.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearCart}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear Cart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Content Grid */}
      {isInitialLoading ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Item List (Left) */}
          <div className="lg:col-span-2 space-y-4">
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

          {/* Summary Sidebar (Right) */}
          <div className="lg:col-span-1">
            <CartOrderSummary
              pricing={pricing}
              itemCount={items.reduce((sum, i) => sum + (i.quantity || 1), 0)}
              onProceedToCheckout={() => navigate("/checkout")}
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              onApplyPromo={handleApplyPromo}
              appliedPromo={appliedPromo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
