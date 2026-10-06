import { Request, Response } from "express";
import sendResponse from "@core/constants/responsewrapper.constant.ts";
import { AuthRequest } from "@core/middlewares/auth.middleware.ts";
import * as cartService from "./cart.services.ts";

const getGuestId = (req: Request): string => {
  return (req.headers["x-cart-id"] as string) || "guest-session";
};

const getUserId = (req: AuthRequest): string | undefined => {
  if (!req.user) return undefined;
  const uid = req.user._id || req.user.id || req.user.sub;
  return uid ? String(uid) : undefined;
};

export const getCart = async (req: AuthRequest, res: Response) => {
  const guestId = getGuestId(req);
  const userId = getUserId(req);
  const cart = await cartService.getCart(guestId, userId);
  return sendResponse.fetched(res, "Cart", cart);
};

export const addItemToCart = async (req: AuthRequest, res: Response) => {
  const guestId = getGuestId(req);
  const userId = getUserId(req);
  const { productId, quantity } = req.body;
  const cart = await cartService.addItemToCart(guestId, productId, quantity, userId);
  return sendResponse.created(res, "Item added to cart", cart);
};

export const updateCartItemQuantity = async (req: AuthRequest, res: Response) => {
  const guestId = getGuestId(req);
  const userId = getUserId(req);
  const { productId, quantity } = req.body;
  const cart = await cartService.updateCartItemQuantity(guestId, productId, quantity, userId);
  return sendResponse.updated(res, "Cart updated", cart);
};

export const removeItemFromCart = async (req: AuthRequest, res: Response) => {
  const guestId = getGuestId(req);
  const userId = getUserId(req);
  const productId = req.params.productId as string;
  const cart = await cartService.removeItemFromCart(guestId, productId, userId);
  return sendResponse.updated(res, "Item removed from cart", cart);
};

export const updateCartAddress = async (req: AuthRequest, res: Response) => {
  const guestId = getGuestId(req);
  const userId = getUserId(req);
  const { shipping_address } = req.body;
  const cart = await cartService.updateCartShippingAddress(guestId, shipping_address, userId);
  return sendResponse.updated(res, "Shipping address updated", cart);
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  const guestId = getGuestId(req);
  const userId = getUserId(req);
  const cart = await cartService.clearCart(guestId, userId);
  return sendResponse.deleted(res, "Cart cleared", cart);
};

export const checkoutCart = async (req: AuthRequest, res: Response) => {
  const guestId = getGuestId(req);
  const userId = getUserId(req);
  const order = await cartService.checkoutCart(guestId, req.body, userId);
  return sendResponse.created(res, "Order placed successfully from cart", order);
};
