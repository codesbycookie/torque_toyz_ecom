import Wishlist from '@db/models/wishlist.model.ts';
import { enhanceWishlist } from './wishlist.util.ts';

export const getWishlistByUser = async (userId: string) => {
  const wishlist = await Wishlist.getByUser(userId);
  if (!wishlist) return null;
  return enhanceWishlist(wishlist);
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