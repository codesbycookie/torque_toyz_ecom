import { useProductStore } from "@/modules/product/product.store";

export const syncProductWishlistState = (wishlistProductList) => {
  const wishlistedIds = new Set((wishlistProductList || []).map((p) => p._id || p));
  const productStore = useProductStore.getState();

  if (productStore.list?.length) {
    const updatedList = productStore.list.map((p) => ({
      ...p,
      is_in_wishlist: wishlistedIds.has(p._id),
    }));
    productStore.set(updatedList);
  }

  if (productStore.current) {
    productStore.setCurrent({
      ...productStore.current,
      is_in_wishlist: wishlistedIds.has(productStore.current._id),
    });
  }
};

export const updateProductWishlistState = (productId, isInWishlist) => {
  const productStore = useProductStore.getState();

  if (productStore.current && productStore.current._id === productId) {
    productStore.setCurrent({
      ...productStore.current,
      is_in_wishlist: isInWishlist,
    });
  }

  if (productStore.list?.length) {
    const updatedList = productStore.list.map((p) =>
      p._id === productId ? { ...p, is_in_wishlist: isInWishlist } : p
    );
    productStore.set(updatedList);
  }
};
