import { z } from 'zod';

export const productUISchema = z.object({
  slash_price: z.coerce.number().min(0, 'Slash price cannot be negative').optional().default(0),
  actual_price: z.coerce.number().min(0, 'Actual price cannot be negative').optional().default(0),
  badges: z.array(z.string().trim()).optional().default([]),
  is_trending: z.boolean().optional().default(false),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name is too short'),
  description: z.string().trim().optional(),
  images: z.array(z.string()).max(5, 'Maximum of 5 images allowed').optional(),
  weight: z.number().positive('Weight must be greater than 0'),
  price: z.number().nonnegative().optional().default(0),
  stock: z.number().nonnegative().optional().default(0),
  category: z.string().min(1, 'Category is required'),
  active: z.boolean().optional().default(true),
  ui: productUISchema.optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const setProductActiveStatusSchema = z.object({
  active: z.boolean(),
});
