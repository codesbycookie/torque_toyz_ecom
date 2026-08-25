import { createPaymentOrderSchema, refundPaymentSchema, verifyPaymentSchema } from '@modules/payment/payment.validator.ts';
import z from 'zod';

export type CreatePaymentOrderPayload = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentPayload = z.infer<typeof verifyPaymentSchema>;

export type RefundPaymentPayload = z.infer<typeof refundPaymentSchema>;