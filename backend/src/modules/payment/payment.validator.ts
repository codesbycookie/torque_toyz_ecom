import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  orderId: z.string().min(1, 'Order id is required'),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const refundPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order id is required'),
  reason: z.string().trim().optional(),
});