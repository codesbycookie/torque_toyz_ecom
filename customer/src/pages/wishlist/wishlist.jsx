import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/core/contexts/api.context";
import { ProductGrid } from "@/modules/product/product.components";

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

import { Heart, Trash2, ShoppingBag } from "lucide-react";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist } = useApi();

  const list = wishlist.useStore((s) => s.list);
  const loading = wishlist.useStore((s) => s.loading);

  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    wishlist.fetchAll();
  }, []);

  const handleToggleWishlist = (product) => {
    // Everything on this page is already wishlisted → always remove
    wishlist.toggle(product, true);
  };

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product.name);
    // later: cart.addItem(product)
  };

  const handleClear = async () => {
    try {
      setClearing(true);
      await wishlist.clear();
    } finally {
      setClearing(false);
    }
  };

  const isEmpty = !loading?.global && list.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">My Wishlist</h1>
          {list.length > 0 && (
            <Badge variant="secondary" className="font-medium">
              {list.length} {list.length === 1 ? "item" : "items"}
            </Badge>
          )}
        </div>

        {list.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                disabled={clearing}
              >
                <Trash2 size={14} />
                Clear all
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear your wishlist?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {list.length}{" "}
                  {list.length === 1 ? "item" : "items"} from your wishlist.
                  This can’t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClear}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground">
              Save products you love and find them here anytime.
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/products")}>
            <ShoppingBag size={15} />
            Browse products
          </Button>
        </div>
      ) : (
        <ProductGrid
          products={list}
          loading={loading?.global}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlistedIds={list.map((p) => p._id)}
        />
      )}
    </div>
  );
}