import {
    createOrderSchema,
    updateStatusSchema,
    updatePaymentStatusSchema,
} from '@modules/order/order.validator.ts';
import z from 'zod';
import { OrderStatus as ModelOrderStatus, IPayment } from '@db/models/order.model.ts';

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
export type OrderStatus = ModelOrderStatus;
export type PaymentStatus = IPayment['status'];