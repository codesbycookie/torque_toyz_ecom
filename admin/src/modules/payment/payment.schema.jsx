import { z } from "zod";

export const paymentCreateSchema = z.object({
  order: z.string().min(1, { error: "Order is required" }),
  razorpay_order_id: z.string().min(1, { error: "Razorpay Order ID is required" }),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  amount: z.coerce.number().min(0, { error: "Amount cannot be negative" }),
  currency: z.string().default("INR"),
  status: z.enum(["created", "paid", "failed", "refunded"]).default("created"),
  failure_reason: z.string().optional(),
});

export const paymentEditSchema = paymentCreateSchema.partial();