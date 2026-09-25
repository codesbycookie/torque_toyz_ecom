import { Router, raw } from 'express';
import { authMiddleware } from '@core/middlewares/auth.middleware.ts';
import { zodValidate } from '@core/middlewares/zod.validator.js';
import { createPaymentOrderSchema, refundPaymentSchema, verifyPaymentSchema } from './payment.validator.js';
import { getAllPayments, createPaymentOrder, verifyPayment, refundPayment } from './payment.controller.js';

const router = Router();

// Webhook must come BEFORE any express.json() body parser touches this route,
// and needs the raw buffer (not parsed JSON) to verify the HMAC signature.
// Mount this with express.raw() so req.body is a Buffer, then attach it as rawBody.
// router.post(
//   '/webhook',
//   raw({ type: 'application/json' }),
//   (req, res, next) => {
//     (req as any).rawBody = req.body;
//     next();
//   },
//   handleWebhook
// );

router.use(authMiddleware);

router.get('/', getAllPayments);

router.post(
  '/create-order',
  zodValidate(createPaymentOrderSchema, 'body', 'CreatePaymentOrderSchema'),
  createPaymentOrder
);

router.post(
  '/verify',
  zodValidate(verifyPaymentSchema, 'body', 'VerifyPaymentSchema'),
  verifyPayment
);

router.post(
  '/refund',
  zodValidate(refundPaymentSchema, 'body', 'RefundPaymentSchema'),
  refundPayment
);

export default router;