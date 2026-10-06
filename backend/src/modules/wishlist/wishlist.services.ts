import Wishlist from "@db/models/wishlist.model.ts";
import { dynamicFilter } from "@core/constants/dynamicfilter.constant.ts";
import { wishlistFilterConfig } from "./wishlist.filterconfig.ts";
import { enhanceWishlist } from "./wishlist.utils.ts";

export const getWishlistByUser = async (userId: string, queries: Record<string, unknown> = {}) => {
  const result = await dynamicFilter(Wishlist, wishlistFilterConfig, queries, {
    rawQuery: { user: userId },
    forcePopulate: [{ path: "products" }],
    visibility: "all",
  });
  if (result && Array.isArray(result.data) && result.data.length > 0) {
    return enhanceWishlist(result.data[0]);
  }
  return null;
};

export const addProduct = async (userId: string, productId: string) => {
  const wishlist = await Wishlist.addProduct(userId, productId);
  return enhanceWishlist(wishlist);
};

export const removeProduct = async (userId: string, productId: string) => {
  const wishlist = await Wishlist.removeProduct(userId, productId);
  if (!wishlist) return null;
  return enhanceWishlist(wishlist);
};

export const clearWishlist = async (userId: string) => {
  const wishlist = await Wishlist.clear(userId);
  if (!wishlist) return null;
  return enhanceWishlist(wishlist);
};