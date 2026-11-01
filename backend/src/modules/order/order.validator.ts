import { z } from 'zod';

const orderItemInputSchema = z.object({
    product: z.string().min(1, 'Product id is required'),
    quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
    items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
    shipping_address: z.object({
        door: z.string().trim().optional(),
        street: z.string().trim().optional(),
        city: z.string().trim().optional(),
        state: z.string().min(1, 'Delivery state is required'), // location ObjectId
        pincode: z.number().int().positive(),
    }),
    payment_method: z.enum(['cod', 'online']),
});

export const updateStatusSchema = z.object({
    status: z.enum(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']),
    note: z.string().trim().optional(),
});

export const updatePaymentStatusSchema = z.object({
    status: z.enum(['pending', 'paid', 'failed', 'refunded', 'refund_pending', 'cancelled']),
    transaction_id: z.string().trim().optional(),
});

export const updateDeliveryPartnerUrl = z
  .object({
    url: z.string().trim().optional(),
    delivery_partner_url: z.string().trim().optional(),
  })
  .refine((data) => Boolean(data.url || data.delivery_partner_url), {
    message: "url or delivery_partner_url is required",
  });