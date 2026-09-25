import { Router } from "express";
import { authMiddleware } from "@core/middlewares/auth.middleware.ts";
import { optionalAuthMiddleware } from "@core/middlewares/optionalAuth.middleware.ts";
// import { accessControl } from '@core/middlewares/access.middleware.js';
import { zodValidate } from "@core/middlewares/zod.validator.js";
import {
  createOrderSchema,
  updateStatusSchema,
  updatePaymentStatusSchema,
  updateDeliveryPartnerUrl,
} from "./order.validator.js";

import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  retrieveOrder,
  setDeliveryPartnerUrl,
  getDraft,
  addItemToDraft,
  updateDraftQuantity,
  removeDraftItem,
  updateDraftAddress,
  clearDraft,
  checkoutDraft
} from "./order.controller.ts";

const router = Router();

// Draft (Cart) Routes
router.get("/draft", optionalAuthMiddleware, getDraft);
router.post("/draft/items", optionalAuthMiddleware, addItemToDraft);
router.put("/draft/items", optionalAuthMiddleware, updateDraftQuantity);
router.delete("/draft/items/:productId", optionalAuthMiddleware, removeDraftItem);
router.put("/draft/address", optionalAuthMiddleware, updateDraftAddress);
router.delete("/draft", optionalAuthMiddleware, clearDraft);
router.post("/draft/checkout", optionalAuthMiddleware, checkoutDraft);

router.use(authMiddleware);

// router.use(accessControl);

router.post(
  "/",
  zodValidate(createOrderSchema, "body", "CreateOrderSchema"),
  createOrder,
);

router.get("/", getAllOrders);

router.get("/mine", getMyOrders);

router.get("/:id", getOrderById);

router.patch(
  "/:id/status",
  zodValidate(updateStatusSchema, "body", "UpdateStatusSchema"),
  updateOrderStatus,
);

router.patch(
  "/:id/payment-status",
  zodValidate(updatePaymentStatusSchema, "body", "UpdatePaymentStatusSchema"),
  updatePaymentStatus,
);

router.patch("/:id/delivery-partner-url", zodValidate(updateDeliveryPartnerUrl, 'params', "UpdateOrderStatus"), setDeliveryPartnerUrl);

router.delete("/:id", deleteOrder);

router.put("/:id/retrieve", retrieveOrder);

export default router;
