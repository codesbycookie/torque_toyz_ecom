import { Router } from "express";
import { optionalAuthMiddleware } from "@core/middlewares/optionalAuth.middleware.ts";
import { zodValidate } from "@core/middlewares/zod.validator.js";
import {
  addItemSchema,
  updateQuantitySchema,
  updateShippingAddressSchema,
  checkoutCartSchema,
} from "./cart.validator.js";
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  updateCartAddress,
  clearCart,
  checkoutCart,
} from "./cart.controller.ts";

const router = Router();

export const basePath = "/cart";

// Direct Cart Routes
router.get("/", optionalAuthMiddleware, getCart);
router.post("/items", optionalAuthMiddleware, zodValidate(addItemSchema, "body", "AddItemSchema"), addItemToCart);
router.put("/items", optionalAuthMiddleware, zodValidate(updateQuantitySchema, "body", "UpdateQuantitySchema"), updateCartItemQuantity);
router.delete("/items/:productId", optionalAuthMiddleware, removeItemFromCart);
router.put("/address", optionalAuthMiddleware, zodValidate(updateShippingAddressSchema, "body", "UpdateShippingAddressSchema"), updateCartAddress);
router.delete("/", optionalAuthMiddleware, clearCart);
router.post("/checkout", optionalAuthMiddleware, zodValidate(checkoutCartSchema, "body", "CheckoutCartSchema"), checkoutCart);

export default router;
