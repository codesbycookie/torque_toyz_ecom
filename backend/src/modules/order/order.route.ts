import { Router } from "express";
import { authMiddleware } from "@core/middlewares/auth.middleware.js";
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
} from "./order.controller.js";

const router = Router();

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
